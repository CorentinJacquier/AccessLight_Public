//gestion des acces par authentification 

class AuthManager {

    //Definition des modeles
    static userModel = null;
    static roleModel = null;

    //Definition des permissions (avec décalage << (shift))
    static permissions = {
        SELECT: 1 << 0, //1
        UPDATE: 1 << 1, //2
        INSERT: 1 << 2, //4
        DELETE: 1 << 3  //8
    }

    //Fonction pour deconnecter l'utilisateur
    static logout(req) {
        delete req.session.userId;
    }

    //Fonction pour verfier si l'utitlisateur est connecté
    static isLoggedIn(req) {
        return new Promise(async (rs, rj) => {
            if(req.session.userId) {
                req.session.user = await this.getCurrentUser(req);
                rs(true);
            }
            rs(false);
        });
    }

    //Fonction pour retourner le role de l'utilisateur connecté
    static async getCurrentUser(req) {
        return new Promise(async (rs, rj) => {
            var user = await this.userModel.findOne({ where: { id: req.session.userId } });
            var role = await this.roleModel.findOne({ where: { id: user.role } });
            req.session.role = role;
            user.role = role;
            user.permissions = this.parseUserPermissions(user.role);
            rs(user);
        });
    }

    //Fonction pour retourner le badge de l'utilisateur
    static async getCurrentUserBadge(req) {
        return new Promise(async (rs, rj) => {
            var user = await this.userModel.findOne({ where: { id: req.session.userId } });
            var badge = user.badge;
            rs(badge);
        });
    }

    //Definition des type d'actions en fonction du role
    static parseUserPermissions(role) {
        var perms = {
            badges: {
                select: false,
                update: false,
                insert: false,
                delete: false
            },
            historique: {
                select: false,
                update: false,
                insert: false,
                delete: false
            },
            batiment: {
                select: false,
                update: false,
                insert: false,
                delete: false
            },
            admin: {
                select: false,
                update: false,
                insert: false,
                delete: false
            }
        };

    //Attribution des actions pour la gestion des badges
    for(let i = 0; i < Object.keys(perms).length; i++) {
        if(role.perm_badge & this.permissions.SELECT) perms['badges'].select = true;
        if(role.perm_badge & this.permissions.UPDATE) perms['badges'].update = true;
        if(role.perm_badge & this.permissions.INSERT) perms['badges'].insert = true;
        if(role.perm_badge & this.permissions.DELETE) perms['badges'].delete = true;
    }

    //Attribution des actions pour la gestion des historiques
    for(let i = 0; i < Object.keys(perms).length; i++) {
           
        if(role.perm_historique & this.permissions.SELECT) perms['historique'].select = true;
        if(role.perm_historique & this.permissions.UPDATE) perms['historique'].update = true;
        if(role.perm_historique & this.permissions.INSERT) perms['historique'].insert = true;
        if(role.perm_historique & this.permissions.DELETE) perms['historique'].delete = true;
    }

    //Attribution des actions pour la gestion des batiments
    for(let i = 0; i < Object.keys(perms).length; i++) {
       
        if(role.perm_batiment & this.permissions.SELECT) perms['batiment'].select = true;
        if(role.perm_batiment & this.permissions.UPDATE) perms['batiment'].update = true;
        if(role.perm_batiment & this.permissions.INSERT) perms['batiment'].insert = true;
        if(role.perm_batiment & this.permissions.DELETE) perms['batiment'].delete = true;
    }

    //Attribution des actions pour la gestion des utilisateurs
    for(let i = 0; i < Object.keys(perms).length; i++) {
           
        if(role.perm_admin & this.permissions.SELECT) perms['admin'].select = true;
        if(role.perm_admin & this.permissions.UPDATE) perms['admin'].update = true;
        if(role.perm_admin & this.permissions.INSERT) perms['admin'].insert = true;
        if(role.perm_admin & this.permissions.DELETE) perms['admin'].delete = true;
    }
    
    return perms;
    }

}

module.exports = AuthManager;