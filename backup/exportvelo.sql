-- phpMyAdmin SQL Dump
-- version 3.1.5
-- http://www.phpmyadmin.net
--
-- Serveur: chrivier.sql.free.fr
-- Généré le : Mer 11 Février 2026 à 14:22
-- Version du serveur: 5.0.83
-- Version de PHP: 5.3.9

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";

--
-- Base de données: `chrivier`
--

-- --------------------------------------------------------

--
-- Structure de la table `velo`
--

CREATE TABLE IF NOT EXISTS `velo` (
  `id` int(11) NOT NULL auto_increment,
  `name` varchar(30) collate latin1_general_ci NOT NULL,
  `description` varchar(200) collate latin1_general_ci NOT NULL,
  `datein` date NOT NULL,
  `dateout` date NOT NULL,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci AUTO_INCREMENT=10 ;

--
-- Contenu de la table `velo`
--

INSERT INTO `velo` (`id`, `name`, `description`, `datein`, `dateout`) VALUES
(1, 'Performer GoalX26', 'Performer', '2009-04-01', '0000-00-00'),
(2, 'Vendetta', 'Cruzbike', '2014-08-01', '0000-00-00'),
(3, 'Taftaf', 'Autoconstruction', '2015-10-01', '2017-04-01'),
(4, 'La Mule (Autoconstruction)', 'autocontruction', '2010-06-01', '0000-00-00'),
(5, 'Performer SAKI', '', '2011-06-01', '2014-09-01'),
(6, 'Proto2', 'Autoconstruction', '2008-08-01', '0000-00-00'),
(7, 'LaGuimauve', 'Autoconstruction', '2013-05-01', '0000-00-00'),
(8, 'FlevoRacer', 'Flevo', '2017-05-01', '0000-00-00'),
(9, 'Pasta DF', 'velomobile', '2021-02-26', '0000-00-00');

