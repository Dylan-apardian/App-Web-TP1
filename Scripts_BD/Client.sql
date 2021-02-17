-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3307
-- Généré le : mer. 17 fév. 2021 à 20:49
-- Version du serveur :  10.4.13-MariaDB
-- Version de PHP : 7.3.21

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `bd_kdd`
--

-- --------------------------------------------------------

--
-- Structure de la table `client`
--

DROP TABLE IF EXISTS `client`;
CREATE TABLE IF NOT EXISTS `client` (
  `client_ID` int(6) NOT NULL,
  `client_NOM` varchar(200) NOT NULL,
  `client_PRENOM` varchar(200) NOT NULL,
  `client_TELEPHON` int(15) NOT NULL,
  `client_COURRIEL` varchar(200) NOT NULL,
  `DATE_DE_CREATION` datetime NOT NULL DEFAULT current_timestamp(),
  `MOT_DE_PASSE` text NOT NULL,
  `Adresse` text DEFAULT NULL,
  `Date_de_naissance` datetime DEFAULT NULL,
  `Code_postale` text DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `client`
--

INSERT INTO `client` (`client_ID`, `client_NOM`, `client_PRENOM`, `client_TELEPHON`, `client_COURRIEL`, `DATE_DE_CREATION`, `MOT_DE_PASSE`, `Adresse`, `Date_de_naissance`, `Code_postale`) VALUES
(123456, 'Alhelou', 'Khalil', 120120111, 'khalilalhelou@gmail.com', '2021-02-10 17:24:06', 'k5j4h3f2', '1585,rue Louis-Carrier ', '1997-10-01 08:00:00', 'H4K2B4'),
(456789, 'Apardian', 'Dylan', 215421121, 'dylanapardian@gmail.com', '2021-02-08 12:12:43', 'd2a4b5v2', '600,rue saint-cathrine ', '2002-07-09 09:30:00', 'H3l2k4'),
(264524, 'Herard', 'Dorensky', 111212121, 'dorenskyherard@gmail.com', '2021-02-12 08:24:43', 'd8h1n2b1', '5821,rue saint-Michelle ', '2001-11-17 13:40:30', 'H5B2D4');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
