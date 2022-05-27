//Index du projet AccessLight par Corentin JACQUIER BTS SIO2  pour ppe (projet leger)  

//import des modules expresse, csrf...
const express = require('express');
const bodyParser = require("body-parser");
const methodOverride = require('method-override');
const session = require('express-session')
const MemoryStore = require('memorystore')(session)
const csurf = require('csurf');

const app = express();

//import de la base de donnée 
const dbConfig = require('./data/db.json');
const Database = require('./core/Database');

//import du controller
const Controller = require('./core/Controller');

//import du module d'authentification
const AuthManager = require('./core/AuthManager');

//import des modele de la base de donnée
let db = new Database(dbConfig.host, dbConfig.port, dbConfig.user, dbConfig.password, dbConfig.database);
const {User, Role, Batiment, Aile, Salle, Historique, Badges, Rang} = db.sequelize.models;

//Import des modeles avec AuthManager
AuthManager.userModel = User;
AuthManager.roleModel = Role;

//setup de ejs
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(session({ store: new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
  resave: false, secret: 'superSecret', path: '/' }));
app.use(csurf({ cookie: false }));

//routes de l'accueil par default
app.get('/', (req, res) => Controller.showHomepage(req, res, Badges, Rang));

//routes page de connexion / deconnexion
app.get('/login', (req, res) => Controller.showLogin(req, res));
app.get('/logout', (req, res) => Controller.handleLogout(req, res));
app.post('/login', (req, res) => Controller.handleLogin(req, res, User));
app.get('/unauthorized', (req, res) => Controller.showUnauthorized(req, res));

//routes de l'affichage des listes
app.get('/batiment', (req, res) => Controller.renderPlan(req, res, "Plan du site", "Liste des batiments", "batiment", Batiment, "Liste des ailes", "aile", Aile, "Liste des salles", "salle", Salle, "batiment"));
app.get('/badges', (req, res) => Controller.list(req, res, "Liste des badges", "badges", Badges, "badges"));
app.get('/historique', (req, res) => Controller.list(req, res, "Historique des accès", "historique", Historique, "historique"));
app.get('/users', (req, res) => Controller.list(req, res, "Liste des utilisateurs", "user", User, "admin"));

//routes de l'affichage du detail / modification 
app.get('/batiment/:identifier', (res, req) => Controller.showDetails(res, req, 'code', '/batiment', 'batiment', Batiment, db, "batiment"));
app.get('/aile/:identifier', (res, req) => Controller.showDetails(res, req, 'code', '/batiment', 'aile', Aile, db, "batiment"));
app.get('/salle/:identifier', (res, req) => Controller.showDetails(res, req, 'code', '/batiment', 'salle', Salle, db, "batiment"));
app.get('/badges/:identifier', (res, req) => Controller.showDetails(res, req, 'code', '/badges', 'badges', Badges, db, "badges"));
app.get('/rang/:identifier', (res, req) => Controller.showDetails(res, req, 'num', '/badges', 'rang', Rang, db, "badges"));
app.get('/historique/:identifier', (res, req) => Controller.showDetails(res, req, 'date', '/historique', 'historique', Historique, db, "historique"));
app.get('/users/:identifier', (res, req) => Controller.showDetails(res, req, 'id', '/users', 'user', User, db, "admin"));

//routes pages d'ajout
app.get('/new/batiment', (req, res) => Controller.showCreate(req, res, 'Créer un nouveau batiement', '/batiment', 'batiment', db, "batiment"));
app.get('/new/aile', (req, res) => Controller.showCreate(req, res, 'Créer une nouvelle aile', '/batiment', 'aile', db, "batiment"));
app.get('/new/salle', (req, res) => Controller.showCreate(req, res, 'Créer une nouvelle salle', '/batiment', 'salle', db, "batiment"));
app.get('/new/badges', (req, res) => Controller.showCreate(req, res, 'Créer un nouveau badge', '/badges', 'badges', db, "badges"));
app.get('/new/rang', (req, res) => Controller.showCreate(req, res, 'Créer un nouveau rang', '/badges', 'rang', db, "badges"));
app.get('/new/historique', (req, res) => Controller.showCreate(req, res, 'Créer un nouveau historique', '/historique', 'historique', db, "historique"));
app.get('/new/user', (req, res) => Controller.showCreate(req, res, 'Créer un nouvel utilisateur', '/users', 'user', db, "admin"));

//routes pour la gestion de création
app.post('/new/batiment', (res, req) => Controller.handleCreate(res, req, '/batiment', 'batiment', Batiment, "batiment"));
app.post('/new/aile', (res, req) => Controller.handleCreate(res, req, '/batiment', 'aile', Aile, "batiment"));
app.post('/new/salle', (res, req) => Controller.handleCreate(res, req, '/batiment', 'salle', Salle, "batiment"));
app.post('/new/badges', (res, req) => Controller.handleCreate(res, req, '/badges', 'badges', Badges, "badges"));
app.post('/new/rang', (res, req) => Controller.handleCreate(res, req, '/badges', 'rang', Rang, "badges"));
app.post('/new/historique', (res, req) => Controller.handleCreate(res, req, '/historique', 'historique', Historique, "historique"));
app.post('/new/user', (res, req) => Controller.handleCreate(res, req, '/users', 'user', User, "admin"));

//routes pour la gestion des modifications
app.post('/batiment/:identifier', (res, req) => Controller.handleModifications(res, req, 'code', '/batiment', 'batiment', Batiment, db, "batiment"));
app.post('/aile/:identifier', (res, req) => Controller.handleModifications(res, req, 'code', '/batiment', 'aile', Aile, db, "batiment"));
app.post('/salle/:identifier', (res, req) => Controller.handleModifications(res, req, 'code', '/batiment', 'salle', Salle, db, "batiment"));
app.post('/badges/:identifier', (res, req) => Controller.handleModifications(res, req, 'code', '/badges', 'badges', Badges, db, "badges"));
app.post('/rang/:identifier', (res, req) => Controller.handleModifications(res, req, 'num', '/badges', 'rang', Rang, db, "badges"));
app.post('/users/:identifier', (res, req) => Controller.handleModifications(res, req, 'id', '/users', 'user', User, db, "admin"));

//routes pour la gestion de suppression 
app.delete('/batiment/:identifier', (res, req) => Controller.handleDelete(res, req, 'code', '/batiment', 'batiment', Batiment, "batiment"));
app.delete('/aile/:identifier', (res, req) => Controller.handleDelete(res, req, 'code', '/batiment', 'aile', Aile, "batiment"));
app.delete('/salle/:identifier', (res, req) => Controller.handleDelete(res, req, 'code', '/batiment', 'salle', Salle, "batiment"));
app.delete('/badges/:identifier', (res, req) => Controller.handleDelete(res, req, 'code', '/badges', 'badges', Badges, "badges"));
app.delete('/rang/:identifier', (res, req) => Controller.handleDelete(res, req, 'num', '/badges', 'rang', Rang, "badges"));
app.delete('/users/:identifier', (res, req) => Controller.handleDelete(res, req, 'id', '/users', 'user', User, "admin"));

//routes gestion des erreurs de création
app.get('/new/error', (res, req) => Controller.showCreateError(res, req, "admin"));

//port de l'application (port de l'host et 30 en local)
app.listen(process.env.PORT || 30); 