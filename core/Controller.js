//Controller possedant les fonctions

const rows = require('../data/rows.json');
const sha512 = require('js-sha512').sha512;

const AuthManager = require('./AuthManager');

class Controller {
    //affichage page d'accueil
    static async showHomepage(req, res, entityModel1, entityModel2) {
        //Redirection vers la page de connexion si l'utilisateur n'est pas connecté
        if (!(await AuthManager.isLoggedIn(req))) return res.redirect('/login');

        var userBadge = await AuthManager.getCurrentUserBadge(req);

        //Recherhe du rang du badge  (requete : { code: 123 } )
        var reqest1 = {};
        reqest1['code'] = userBadge;
        var badgeData = await entityModel1.findOne({where: reqest1});

        //Recherche du privilege associé au rang du badge (requete : { code: 1 } )
        var reqest2 = {};
        reqest2['num'] = badgeData.rang;
        var privilege = await entityModel2.findOne({where: reqest2});

        res.render('home', {
            user: req.session.user,
            badge: userBadge,
            badgeRang: badgeData.rang,
            privilege: privilege.privilege,
        });
    }

    //Affichage de la page de connexion et redirection
    static async showLogin(req, res) {
        if (await AuthManager.isLoggedIn(req)) return res.redirect('/');

        res.render('login', {
            csrfToken: req.csrfToken(),
            error: false,
            success: false
        });
    }

    //Affichage page connexion non autorisée
    static async showUnauthorized(req, res) {
        if (!(await AuthManager.isLoggedIn(req))) return res.redirect('/login');

        res.render('unauthorized', {
            user: req.session.user
        });
    }

    //Gestion de la connexion de l'utilisateur
    static async handleLogin(req, res, userModel) {
        
        var user = await userModel.findOne({
            where: {
                email: req.body.email,
                password: sha512(req.body.password)
            }
        });

        if (user) {
            req.session.userId = user.id;

            res.render('login', {
                csrfToken: req.csrfToken(),
                error: false,
                success: "Bienvenue, chargement du site !",
                user: req.session.user
            });
        } else {
            res.render('login', {
                csrfToken: req.csrfToken(),
                error: "Mot de passe ou mail érroné, attention les champs sont sensibles aux majuscules et minuscules !",
                success: false,
                user: req.session.user
            });
        }
    }


    //Redirection lors de la deconnexion de l'utilisateur
    static async handleLogout(req, res) {
        AuthManager.logout(req);
        res.redirect('/login');
    }

    //affichage en liste du modele / entité donné
    static async list(req, res, pageName, entityName, entityModel, permType) {
        //Gestion de l'authentification
        if (!(await AuthManager.isLoggedIn(req))) return res.redirect('/login');
        if (!req.session.user.permissions[permType].select) return res.redirect('/unauthorized');

        var data = await entityModel.findAll();

        //recupération du badge de l'utilisateur
        var userBadge = await AuthManager.getCurrentUserBadge(req);

        //Affichage de tous les historique d'acces pour les administrateurs
        if(req.session.user.permissions['admin'].select) { var admin = true } else { var admin = false };

        res.render('list', {
            pageName: pageName,
            rows: rows[entityName],
            data: data,
            entityName: entityName,
            user: req.session.user,
            csrfToken: req.csrfToken(),
            badge: userBadge,
            admin: admin,
            note: false
        });
    }

    //Affichage des batiments, ailes et salles
    static async renderPlan(req, res,pageName, pageName1, entityName1, entityModel1, pageName2, entityName2, entityModel2 , pageName3, entityName3, entityModel3, permissionType) {
        if (!(await AuthManager.isLoggedIn(req))) return res.redirect('/login');
        if (!req.session.user.permissions[permissionType].select) return res.redirect('/unauthorized');
        
        var data1 = await entityModel1.findAll(); //Batiment
        var data2 = await entityModel2.findAll(); //Aile 
        var data3 = await entityModel3.findAll(); //Salles

        //recupération du badge de l'utilisateur
        var userBadge = await AuthManager.getCurrentUserBadge(req);

        res.render('plan', {
            pageName: pageName,
            pageName1: pageName1,
            pageName2: pageName2,
            pageName3: pageName3,
            rows1: rows[entityName1],
            rows2: rows[entityName2],
            rows3: rows[entityName3],
            data1: data1,
            data2: data2,
            data3: data3,
            entityName1: entityName1,
            entityName2: entityName2,
            entityName3: entityName3,
            user: req.session.user,
            badge: userBadge,
            note: false
        }); 
    }

    //affichage des details
    static async showDetails(req, res, identifierColumn, redirect, entityName, entityModel, database, permType) {
        if (!(await AuthManager.isLoggedIn(req))) return res.redirect('/login');
        if (!req.session.user.permissions[permType].select) return res.redirect('/unauthorized');
        
        var whereClauses = {};
        whereClauses[identifierColumn] = req.params.identifier;

        var data = await entityModel.findOne({
            where: whereClauses
        });

        if (data) {

            var foreignKeys = {};
            var parentKeys = {};

            for (let i = 0; i < Object.keys(rows[entityName]).length; i++) {
                var value = Object.values(rows[entityName])[i];
                var key = Object.keys(rows[entityName])[i];
                
                //affichage des champs remplis
                if (value.isForeignKey && value.references && value.referenceColumn && value.referenceDisplayColumn) {
                    var dbData = await database.selectIdDisplay(value.references, value.referenceColumn, value.referenceDisplayColumn);
                    foreignKeys[key] = dbData;
                }
            
                //verif des sous champs du parent
                if(value.isParent && value.parent && value.referenceParent && value.referenceDisplayColumn) {
                    var dbData = await database.selectIdDisplay(value.parent, value.referenceParent, value.referenceDisplayColumn);
                    for (var j=0; j < Object.keys(dbData).length; j++) {
                        if (data.Code == Object.values(dbData)[j].id || data.num == Object.values(dbData)[j].id){
                            parentKeys += Object.values(dbData)[j];
                        }
                    }
                } 
            }

            res.render('show', {
                data: data,
                rows: rows[entityName],
                note: false,
                csrfToken: req.csrfToken(),
                user: req.session.user,
                foreignKeys: foreignKeys,
                parentKeys: parentKeys
            });
        } else {
            res.redirect(redirect);
        }
    }

    //Affichage page de création 
    static async showCreate(req, res, pageName, redirect, entityName, database, permType, note = false) {
        if (!(await AuthManager.isLoggedIn(req))) return res.redirect('/login');
        if (!req.session.user.permissions[permType].insert) return res.redirect('/unauthorized');
        
        var foreignKeys = {};

        for (let i = 0; i < Object.keys(rows[entityName]).length; i++) {
            var value = Object.values(rows[entityName])[i];
            var key = Object.keys(rows[entityName])[i];

            //affichage des champs
            if (value.isForeignKey && value.references && value.referenceColumn && value.referenceDisplayColumn) {
                var dbData = await database.selectIdDisplay(value.references, value.referenceColumn, value.referenceDisplayColumn);
                foreignKeys[key] = dbData;
            }
        }

        res.render('create', {
            pageName: pageName,
            rows: rows[entityName],
            redirectPath: redirect,
            csrfToken: req.csrfToken(),
            user: req.session.user,
            foreignKeys,
            note
        });
    }

    //Affichage des erreurs de créations
    static async showCreateError(req, res, permType) {
        if (!(await AuthManager.isLoggedIn(req))) return res.redirect('/login');
        if (!req.session.user.permissions[permType].insert) return res.redirect('/unauthorized');
        
        res.render('error', {
            errorTitle: "Erreur lors de la création de l'entité",
            errorText: "Veuillez vérifier les données envoyées, puis réessayez.",
            user: req.session.user, 
            lastUrl: req.query.lastUrl ? req.query.lastUrl : false
        });
    }

    //Gestion de la création d'une entité 
    static async handleCreate(req, res, redirect, entityName, entityModel, permType) {
        if (!(await AuthManager.isLoggedIn(req))) return res.redirect('/login');
        if (!req.session.user.permissions[permType].insert) return res.redirect('/unauthorized');

        var createData = {};

        for (let i = 0; i < Object.keys(rows[entityName]).length; i++) {
            var column = Object.keys(rows[entityName])[i];
            if (req.body[column]) {
                if (rows[entityName][column].hashedValue) {
                    createData[column] = sha512(req.body[column]);
                } else {
                    createData[column] = req.body[column];
                }
            }
        }
        
        var success = true;

        await entityModel.create(createData).catch(err => {
            res.redirect('/new/error?lastUrl=/new/' + entityName);
            success = false;
            return;
        }); 

        if(success) { res.redirect(redirect); }
    }

    //Gestion de la modification d'entité
    static async handleModifications(req, res, identifierColumn, redirect, entityName, entityModel, database, permType) {
        if (!(await AuthManager.isLoggedIn(req))) return res.redirect('/login');
        if (!req.session.user.permissions[permType].update) return res.redirect('/unauthorized');
        

        var whereClauses = {};
        whereClauses[identifierColumn] = req.params.identifier;

        var data = await entityModel.findOne({
            where: whereClauses
        });

        if (data) {
            var updatedData = {};
            var foreignKeys = {};

            for (let i = 0; i < Object.keys(rows[entityName]).length; i++) {
                var column = Object.keys(rows[entityName])[i];

                if (req.body[column]) {
                    if (rows[entityName][column].hashedValue) {
                        updatedData[column] = sha512(req.body[column]);
                    } else {
                        updatedData[column] = req.body[column];
                    }

                    if (rows[entityName][column].isForeignKey && rows[entityName][column].references && rows[entityName][column].referenceColumn && rows[entityName][column].referenceDisplayColumn) {
                        var dbData = await database.selectIdDisplay(rows[entityName][column].references, rows[entityName][column].referenceColumn, rows[entityName][column].referenceDisplayColumn);
                        foreignKeys[column] = dbData;
                    }
                }
            }

            await entityModel.update(updatedData, {
                where: whereClauses
            }).catch(err => {
                res.render('show', {
                    data: data,
                    rows: rows[entityName],
                    note: {
                        "type": "error",
                        "text": "<i class=\"las la-exclamation-circle\"></i> Impossible d'enregistrer les modifications, vérifiez les données."
                    },
                    csrfToken: req.csrfToken(),
                    user: req.session.user,
                    foreignKeys: foreignKeys,
                    parentKeys: ""
                });

                return;
            });

            data = await entityModel.findOne({
                where: whereClauses
            });

            res.render('show', {
                data: data,
                rows: rows[entityName],
                note: {
                    "type": "success",
                    "text": "<i class=\"las la-check\"></i> Modifications enregistrées avec succès !"
                },
                csrfToken: req.csrfToken(),
                user: req.session.user,
                foreignKeys: foreignKeys,
                parentKeys: ""
            });
        } else {
            res.redirect(redirect);
        }
    }

    //Gesttion de la suppression d'une entité 
    static async handleDelete(req, res, identifierColumn, redirect, entityName, entityModel, permType) {
        if (!(await AuthManager.isLoggedIn(req))) return res.redirect('/login');
        if (!req.session.user.permissions[permType].delete) return res.redirect('/unauthorized');
        
        var whereClauses = {};
        whereClauses[identifierColumn] = req.params.identifier;

        var data = await entityModel.findOne({
            where: whereClauses
        });

        //supprime les données (destroy)
        if (data) {
            await entityModel.destroy({
                where: whereClauses
            });
        }

        res.redirect(redirect);
    }

}

module.exports = Controller;