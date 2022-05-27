-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : lun. 07 fév. 2022 à 14:26
-- Version du serveur :  5.7.31
-- Version de PHP : 7.3.21

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `accesslightdb`
--

-- --------------------------------------------------------

--
-- Structure de la table `aile`
--

DROP TABLE IF EXISTS `aile`;
CREATE TABLE IF NOT EXISTS `aile` (
  `code` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) NOT NULL,
  `BatCode` int(11) NOT NULL,
  `RangReq` int(11) NOT NULL,
  PRIMARY KEY (`code`),
  KEY `fk_batcde` (`BatCode`),
  KEY `fk_ailrg` (`RangReq`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `aile`
--

INSERT INTO `aile` (`code`, `nom`, `BatCode`, `RangReq`) VALUES
(1, 'Aile1A', 1, 1);

-- --------------------------------------------------------

--
-- Structure de la table `badges`
--

DROP TABLE IF EXISTS `badges`;
CREATE TABLE IF NOT EXISTS `badges` (
  `code` int(11) NOT NULL,
  `date_creation` varchar(100) DEFAULT NULL,
  `date_invalide` varchar(100) DEFAULT NULL,
  `rang` int(11) DEFAULT NULL,
  PRIMARY KEY (`code`),
  KEY `FK_rangcde` (`rang`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `badges`
--

INSERT INTO `badges` (`code`, `date_creation`, `date_invalide`, `rang`) VALUES
(101, '2022-01-21 00:00:00', '2022-01-14 00:00:00', 1),
(111, '2021-12-17 13:17:17', '2014-12-12 13:17:17', 5),
(123, '2021-12-15 00:00:00', '2022-01-12 00:00:00', 7),
(133, '2022-01-17 00:00:00', '2022-04-22 00:00:00', 4),
(144, '2022-01-12 00:00:00', '2022-01-25 00:00:00', 2);

-- --------------------------------------------------------

--
-- Structure de la table `batiment`
--

DROP TABLE IF EXISTS `batiment`;
CREATE TABLE IF NOT EXISTS `batiment` (
  `code` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) NOT NULL,
  `position` varchar(255) NOT NULL,
  `RangReq` int(11) NOT NULL,
  PRIMARY KEY (`code`),
  KEY `fk_batrg` (`RangReq`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `batiment`
--

INSERT INTO `batiment` (`code`, `nom`, `position`, `RangReq`) VALUES
(1, 'BatA', '45.770326994282684, 4.820307495247894', 1);

-- --------------------------------------------------------

--
-- Structure de la table `historique`
--

DROP TABLE IF EXISTS `historique`;
CREATE TABLE IF NOT EXISTS `historique` (
  `datetime` datetime NOT NULL,
  `batcde` int(11) NOT NULL,
  `ailecde` int(11) NOT NULL,
  `sallecde` int(11) NOT NULL,
  `badge` int(11) NOT NULL,
  `status` varchar(15) NOT NULL,
  PRIMARY KEY (`datetime`),
  KEY `fk_histbatcde` (`batcde`),
  KEY `fk_histailecde` (`ailecde`),
  KEY `fk_histsallecde` (`sallecde`),
  KEY `fk_histbadge` (`badge`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `historique`
--

INSERT INTO `historique` (`datetime`, `batcde`, `ailecde`, `sallecde`, `badge`, `status`) VALUES
('2011-10-14 08:20:00', 1, 1, 3, 133, 'authorized'),
('2011-12-14 08:20:37', 1, 1, 1, 133, 'authorized'),
('2011-12-14 08:35:37', 1, 1, 2, 133, 'authorized'),
('2011-12-14 09:10:37', 1, 1, 5, 133, 'authorized'),
('2011-12-14 10:30:37', 1, 1, 4, 133, 'blocked'),
('2022-01-18 09:34:00', 1, 1, 1, 123, 'authorized'),
('2022-01-18 10:10:00', 1, 1, 1, 101, 'blocked'),
('2022-01-19 10:06:00', 1, 1, 3, 101, 'authorized'),
('2022-01-27 14:19:00', 1, 1, 5, 111, 'authorized'),
('2022-02-11 09:32:00', 1, 1, 1, 111, 'authorized'),
('2022-02-15 13:00:00', 1, 1, 4, 111, 'authorized'),
('2022-02-22 10:04:00', 1, 1, 3, 133, 'authorized'),
('2022-02-28 14:11:00', 1, 1, 3, 123, 'authorized');

--
-- Déclencheurs `historique`
--
DROP TRIGGER IF EXISTS `verif_salle_acces`;
DELIMITER $$
CREATE TRIGGER `verif_salle_acces` BEFORE INSERT ON `historique` FOR EACH ROW IF ((SELECT rang FROM badges where code=new.badge) >= (SELECT rangReq FROM salle where code=new.salleCde)) THEN
SET new.status = 'authorized';
ELSE
SET new.status = 'blocked';
END IF
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `rang`
--

DROP TABLE IF EXISTS `rang`;
CREATE TABLE IF NOT EXISTS `rang` (
  `num` int(11) NOT NULL AUTO_INCREMENT,
  `privilege` varchar(255) NOT NULL,
  PRIMARY KEY (`num`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `rang`
--

INSERT INTO `rang` (`num`, `privilege`) VALUES
(0, 'Aucun accès'),
(1, 'Entrée'),
(2, 'Self'),
(3, 'Bureau'),
(4, 'Remise'),
(5, 'Salle serveur'),
(6, 'Salle sensibles'),
(7, 'Tout');

-- --------------------------------------------------------

--
-- Structure de la table `roles`
--

DROP TABLE IF EXISTS `roles`;
CREATE TABLE IF NOT EXISTS `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `perm_admin` int(11) NOT NULL,
  `perm_badge` int(11) NOT NULL,
  `perm_batiment` int(11) NOT NULL,
  `perm_historique` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `roles`
--

INSERT INTO `roles` (`id`, `name`, `perm_admin`, `perm_badge`, `perm_batiment`, `perm_historique`) VALUES
(1, 'Admin', 15, 15, 15, 15),
(2, 'Gestionnaire badges', 0, 15, 1, 1),
(3, 'Responsable batiments', 0, 1, 15, 1),
(4, 'Utilisateur', 0, 0, 1, 1);

-- --------------------------------------------------------

--
-- Structure de la table `salle`
--

DROP TABLE IF EXISTS `salle`;
CREATE TABLE IF NOT EXISTS `salle` (
  `code` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) NOT NULL,
  `AileCode` int(11) NOT NULL,
  `RangReq` int(11) NOT NULL,
  PRIMARY KEY (`code`),
  KEY `fk_Ailecde` (`AileCode`),
  KEY `fk_salrg` (`RangReq`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `salle`
--

INSERT INTO `salle` (`code`, `nom`, `AileCode`, `RangReq`) VALUES
(1, 'Bureaux 101', 1, 3),
(2, 'Self', 1, 2),
(3, 'Entree', 1, 1),
(4, 'Serveur', 1, 5),
(5, 'Remise', 1, 4),
(6, 'Salles sensibles', 1, 6),
(7, 'Bureaux 102', 1, 3);

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `role` int(11) DEFAULT NULL,
  `badge` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_roleid` (`role`),
  KEY `fk_bdgcde` (`badge`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `first_name`, `last_name`, `role`, `badge`) VALUES
(1, 'cojacquier@gmail.com', '969a9b92c9082ddce616345ae9e72fe10fe8b42fae0bea2bd4730538b9fd881247278ffabd4359a54ad6aa1b7af0d238e29fc15216e842acc85ec505fcd119cf', 'Corentin', 'JACQUIER', 1, 123),
(3, 'user@gsb.fr', 'd9e6762dd1c8eaf6d61b3c6192fc408d4d6d5f1176d0c29169bc24e71c3f274ad27fcd5811b313d681f7e55ec02d73d499c95455b6b5bb503acf574fba8ffe85', 'User', 'User', 4, 101),
(4, 'gest.badge@gsb.fr', 'd9e6762dd1c8eaf6d61b3c6192fc408d4d6d5f1176d0c29169bc24e71c3f274ad27fcd5811b313d681f7e55ec02d73d499c95455b6b5bb503acf574fba8ffe85', 'Badge', 'Badge', 2, 111),
(5, 'gest.bat@gsb.fr', 'd9e6762dd1c8eaf6d61b3c6192fc408d4d6d5f1176d0c29169bc24e71c3f274ad27fcd5811b313d681f7e55ec02d73d499c95455b6b5bb503acf574fba8ffe85', 'Batman', 'Batman', 3, 133);

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `aile`
--
ALTER TABLE `aile`
  ADD CONSTRAINT `fk_ailrg` FOREIGN KEY (`RangReq`) REFERENCES `rang` (`num`),
  ADD CONSTRAINT `fk_batcde` FOREIGN KEY (`BatCode`) REFERENCES `batiment` (`code`);

--
-- Contraintes pour la table `badges`
--
ALTER TABLE `badges`
  ADD CONSTRAINT `FK_rangcde` FOREIGN KEY (`rang`) REFERENCES `rang` (`num`);

--
-- Contraintes pour la table `batiment`
--
ALTER TABLE `batiment`
  ADD CONSTRAINT `fk_batrg` FOREIGN KEY (`RangReq`) REFERENCES `rang` (`num`);

--
-- Contraintes pour la table `historique`
--
ALTER TABLE `historique`
  ADD CONSTRAINT `fk_histailecde` FOREIGN KEY (`ailecde`) REFERENCES `aile` (`code`),
  ADD CONSTRAINT `fk_histbadge` FOREIGN KEY (`badge`) REFERENCES `badges` (`code`),
  ADD CONSTRAINT `fk_histbatcde` FOREIGN KEY (`batcde`) REFERENCES `batiment` (`code`),
  ADD CONSTRAINT `fk_histsallecde` FOREIGN KEY (`sallecde`) REFERENCES `salle` (`code`);

--
-- Contraintes pour la table `salle`
--
ALTER TABLE `salle`
  ADD CONSTRAINT `fk_Ailecde` FOREIGN KEY (`AileCode`) REFERENCES `aile` (`code`),
  ADD CONSTRAINT `fk_salrg` FOREIGN KEY (`RangReq`) REFERENCES `rang` (`num`);

--
-- Contraintes pour la table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_bdgcde` FOREIGN KEY (`badge`) REFERENCES `badges` (`code`),
  ADD CONSTRAINT `fk_roleid` FOREIGN KEY (`role`) REFERENCES `roles` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
