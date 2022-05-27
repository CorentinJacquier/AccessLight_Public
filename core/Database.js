//Gestion de la base de données et des modeles

const {Sequelize,DataTypes,QueryTypes} = require('sequelize');

class Database {
    constructor(host, port, user, password, database) {
        this.sequelize = new Sequelize(database, user, password, {
            host: host,
            port: port,
            dialect: 'mysql',
            charset: 'utf8'
        });
        this.registerModels();

    }
    registerModels() {
        //Modele d'un batiment
        this.sequelize.define("Batiment", {
            Code: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false
            },
            Nom: {
                type: DataTypes.STRING,
                allowNull: false
            },
            Position: {
                type: DataTypes.STRING,
                allowNull: false
            },
            RangReq: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: 'Rang',
                referencesKey: 'Num'
            }
        }, {
            tableName: 'batiment',
            timestamps: false
        });
        //Modele d'une aile
        this.sequelize.define("Aile", {
            Code: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false
            },
            Nom: {
                type: DataTypes.STRING,
                allowNull: false
            },
            BatCode: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: 'Batiment',
                referencesKey: 'Code'
            },
            RangReq: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: 'Rang',
                referencesKey: 'Num'
            }
        }, {
            tableName: 'aile',
            timestamps: false
        });
        //Modele d'une salle
        this.sequelize.define("Salle", {
            Code: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false
            },
            Nom: {
                type: DataTypes.STRING,
                allowNull: false
            },
            AileCode: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: 'Aile',
                referencesKey: 'Code'
            },
            RangReq: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: 'Rang',
                referencesKey: 'Num'
            }
        }, {
            tableName: 'salle',
            timestamps: false
        });
        
        //Modele du rang
        this.sequelize.define("Rang", {
            num: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
            },
            privilege: {
                type: DataTypes.STRING,
                allowNull: false
            }
        }, {
            tableName: 'rang',
            timestamps: false
        });
        //Modele de l'historique
        this.sequelize.define("Historique", {
            datetime: {
                type: DataTypes.DATE,
                primaryKey: true,
                allowNull: false
            },
            batcde: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: 'Batiment',
                referencesKey: 'Code'
            },
            ailecde: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: 'Aile',
                referencesKey: 'Code'
            },
            sallecde: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: 'Salle',
                referencesKey: 'Code'
            },
            badge: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: 'Badges',
                referencesKey: 'Code'
            },
            status: {
                type: DataTypes.STRING,
                allowNull: true
            }
        }, {
            tableName: 'historique',
            timestamps: false
        });

        //Modele de l'utilisateur
        this.sequelize.define("User", {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
                autoIncrement: true
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false
            },
            first_name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            last_name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            role: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: 'Roles',
                referencesKey: 'Id'
            },
            badge: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: 'Badges',
                referencesKey: 'Code'
            }
        }, {
            tableName: 'users',
            timestamps: false
        });

        
        //Modele d'un badge
        this.sequelize.define("Badges", {
            Code: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
            },
            date_creation: {
                type: DataTypes.DATE,
                allowNull: false
            },
            date_invalide: {
                type: DataTypes.DATE,
                allowNull: false
            },
            rang: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: 'Rang',
                referencesKey: 'Num'
            }
        }, {
            tableName: 'badges',
            timestamps: false
        });

        //Modele des roles
        this.sequelize.define("Role", {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            perm_badge: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            perm_historique: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            perm_batiment: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            perm_admin: {
                type: DataTypes.INTEGER,
                allowNull: false
            }
        }, {
            tableName: 'roles',
            timestamps: false
        });
    }

    //Requete pour afficher les données d'une table 
    selectIdDisplay(table, identifierCol, displayCol) {
        return new Promise(async (rs, rj) => {
            var result = await this.sequelize.query('SELECT ' + identifierCol + ', ' + displayCol + ' FROM ' + table, { type: QueryTypes.SELECT });

            var res = [];
            
            for(let i = 0; i < result.length; i++) {
                res.push({
                    id: result[i][identifierCol],
                    display: result[i][displayCol]
                })
            }

            rs(res);
        });
    }
}

module.exports = Database;
