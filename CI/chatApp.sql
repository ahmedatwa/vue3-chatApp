-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Dec 29, 2023 at 03:31 PM
-- Server version: 8.2.0
-- PHP Version: 8.3.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `chatApp`
--

-- --------------------------------------------------------

--
-- Table structure for table `channels`
--

CREATE TABLE `channels` (
  `_id` int UNSIGNED NOT NULL,
  `_channelID` char(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `channelName` varchar(64) NOT NULL,
  `channelTopic` varchar(132) NOT NULL,
  `channelDescription` varchar(132) NOT NULL,
  `channelImage` varchar(132) NOT NULL,
  `createdBy` char(36) NOT NULL,
  `status` int NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `channels`
--

INSERT INTO `channels` (`_id`, `_channelID`, `channelName`, `channelTopic`, `channelDescription`, `channelImage`, `createdBy`, `status`, `createdAt`, `updatedAt`) VALUES
(1, 'sT7tOBUNXwY2IB7', 'Atwa Channel', 'Atwa channel Topic', '', '', 'jal7kd4hd1wRBG2PmJMU', 1, '2023-12-24 14:13:45', '2023-12-26 20:01:36');

-- --------------------------------------------------------

--
-- Table structure for table `channel_members`
--

CREATE TABLE `channel_members` (
  `_id` int NOT NULL,
  `_channelID` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `_uuid` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `displayName` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `status` tinyint(1) NOT NULL,
  `settings` json DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `channel_members`
--

INSERT INTO `channel_members` (`_id`, `_channelID`, `_uuid`, `displayName`, `status`, `settings`, `createdAt`, `updatedAt`) VALUES
(8, 'sT7tOBUNXwY2IB7', 'jal7kd4hd1wRBG2PmJMU', 'Atwa', 1, '{\"muteNotifications\": \"none\"}', '2023-12-24 14:46:13', NULL),
(9, 'sT7tOBUNXwY2IB7', 'mJTPA_ms5iG9ENQaYPdN', 'Mi7s', 1, '{\"muteNotifications\": \"none\"}', '2023-12-24 14:46:13', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `channel_messages`
--

CREATE TABLE `channel_messages` (
  `_id` int NOT NULL,
  `_channelID` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `from` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `fromName` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `editContent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `files` json DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `channel_messages`
--

INSERT INTO `channel_messages` (`_id`, `_channelID`, `from`, `fromName`, `content`, `editContent`, `files`, `createdAt`, `updatedAt`) VALUES
(1, 'sT7tOBUNXwY2IB7', 'jal7kd4hd1wRBG2PmJMU', 'Atwa', '1st msg\n', NULL, NULL, '2023-12-28 21:44:39', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `channel_messages_files`
--

CREATE TABLE `channel_messages_files` (
  `_id` int UNSIGNED NOT NULL,
  `_channelID` char(36) NOT NULL,
  `_uuid` char(36) NOT NULL,
  `name` varchar(132) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `randomName` varchar(132) NOT NULL,
  `size` bigint NOT NULL,
  `type` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `path` varchar(132) NOT NULL,
  `url` varchar(132) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `channel_messages_reactions`
--

CREATE TABLE `channel_messages_reactions` (
  `_id` int UNSIGNED NOT NULL,
  `_messageID` int NOT NULL,
  `_channelID` char(36) NOT NULL,
  `_uuid` char(36) NOT NULL,
  `displayName` varchar(132) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `emoji` text NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `channel_messages_thread`
--

CREATE TABLE `channel_messages_thread` (
  `_id` int UNSIGNED NOT NULL,
  `_messageID` int NOT NULL,
  `_channelID` char(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `from` char(36) NOT NULL,
  `fromName` varchar(64) NOT NULL,
  `to` char(36) NOT NULL,
  `toName` varchar(64) NOT NULL,
  `content` text NOT NULL,
  `files` json DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chat_users_settings`
--

CREATE TABLE `chat_users_settings` (
  `_id` int NOT NULL,
  `displayName` varchar(132) NOT NULL,
  `image` varchar(128) NOT NULL,
  `_uuid` char(36) NOT NULL,
  `settings` json DEFAULT NULL,
  `visible` tinyint(1) NOT NULL,
  `connected` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `chat_users_settings`
--

INSERT INTO `chat_users_settings` (`_id`, `displayName`, `image`, `_uuid`, `settings`, `visible`, `connected`) VALUES
(1, 'Atwa', '', 'jal7kd4hd1wRBG2PmJMU', '{\"theme\": \"light\", \"leftOff\": \"1\", \"muteConnectionNotif\": \"0\"}', 1, 1),
(2, 'Mi7s', '', 'mJTPA_ms5iG9ENQaYPdN', '{\"theme\": \"light\", \"leftOff\": \"1\", \"muteConnectionNotif\": \"0\"}', 1, 1),
(4, 'test1', '', 'lTkZuX4i_3JL_lkC2h8Z', '{\"theme\": \"light\", \"leftOff\": \"1\", \"muteConnectionNotif\": \"0\"}', 1, 1),
(5, 'test2', '', '9SmlFM2cWZRg0CTKQSEM', '{\"theme\": \"light\", \"leftOff\": \"1\", \"muteConnectionNotif\": \"0\"}', 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `direct_messages`
--

CREATE TABLE `direct_messages` (
  `_id` int NOT NULL,
  `_channelID` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `from` char(36) NOT NULL,
  `to` char(36) NOT NULL,
  `content` text NOT NULL,
  `editContent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `files` json DEFAULT NULL,
  `seen` tinyint(1) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `direct_messages`
--

INSERT INTO `direct_messages` (`_id`, `_channelID`, `from`, `to`, `content`, `editContent`, `files`, `seen`, `createdAt`, `updatedAt`) VALUES
(1, '6LUsAFzXyzRiyK-Ga6ef-ZoV1wZqpr', 'jal7kd4hd1wRBG2PmJMU', 'jal7kd4hd1wRBG2PmJMU', '1st msg\n', '', NULL, 0, '2023-12-28 21:44:33', NULL),
(2, '6LUsAFzXyzRiyK-Ga6ef-ZoV1wZqpr', 'jal7kd4hd1wRBG2PmJMU', 'jal7kd4hd1wRBG2PmJMU', 'sdsds ahmed test\n', '', '[\"1\"]', 0, '2023-12-29 07:11:45', NULL),
(3, '6LUsAFzXyzRiyK-Ga6ef-ZoV1wZqpr', 'jal7kd4hd1wRBG2PmJMU', 'jal7kd4hd1wRBG2PmJMU', '(vue3)[<a href=\"https://vuejs.org/guide/reusability/composables.html]\" target=\"blank\">https://vuejs.org/guide/reusability/composables.html]</a>\n', '', NULL, 0, '2023-12-29 09:33:24', NULL),
(4, '6LUsAFzXyzRiyK-Ga6ef-ZoV1wZqpr', 'jal7kd4hd1wRBG2PmJMU', 'jal7kd4hd1wRBG2PmJMU', '(link)[ <a href=\"https://vuejs.org/guide/reusability/composables.html]\" target=\"blank\">https://vuejs.org/guide/reusability/composables.html]</a>\n', '', NULL, 0, '2023-12-29 09:36:04', NULL),
(5, '6LUsAFzXyzRiyK-Ga6ef-ZoV1wZqpr', 'jal7kd4hd1wRBG2PmJMU', 'jal7kd4hd1wRBG2PmJMU', '<a href=\"https://vuejs.org/guide/reusability/composables.html\" target=\"blank\">vue3</a>\n', NULL, NULL, 0, '2023-12-29 09:39:40', NULL),
(6, '6LUsAFzXyzRiyK-Ga6ef-ZoV1wZqpr', 'jal7kd4hd1wRBG2PmJMU', 'jal7kd4hd1wRBG2PmJMU', 'sdsds ahmed test\n', NULL, NULL, 0, '2023-12-29 15:26:52', NULL),
(7, '6LUsAFzXyzRiyK-Ga6ef-ZoV1wZqpr', 'jal7kd4hd1wRBG2PmJMU', 'jal7kd4hd1wRBG2PmJMU', '', NULL, '[\"2\"]', 0, '2023-12-29 15:27:04', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `direct_messages_channels`
--

CREATE TABLE `direct_messages_channels` (
  `_id` int NOT NULL,
  `_channelID` char(36) NOT NULL,
  `from` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `to` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `direct_messages_channels`
--

INSERT INTO `direct_messages_channels` (`_id`, `_channelID`, `from`, `to`, `createdAt`) VALUES
(1, '6LUsAFzXyzRiyK-Ga6ef-ZoV1wZqpr', 'jal7kd4hd1wRBG2PmJMU', 'jal7kd4hd1wRBG2PmJMU', '2023-12-28 21:44:33');

-- --------------------------------------------------------

--
-- Table structure for table `direct_messages_files`
--

CREATE TABLE `direct_messages_files` (
  `_id` int UNSIGNED NOT NULL,
  `_channelID` varchar(36) NOT NULL,
  `_uuid` char(36) NOT NULL,
  `name` varchar(132) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `randomName` varchar(132) NOT NULL,
  `size` bigint NOT NULL,
  `type` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `path` varchar(132) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `url` varchar(164) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `direct_messages_files`
--

INSERT INTO `direct_messages_files` (`_id`, `_channelID`, `_uuid`, `name`, `randomName`, `size`, `type`, `path`, `url`, `createdAt`) VALUES
(1, '6LUsAFzXyzRiyK-Ga6ef-ZoV1wZqpr', 'jal7kd4hd1wRBG2PmJMU', 'Cantwait Milkandmocha GIF', '15070333734785127107', 527035, 'image/gif', NULL, 'https://media.tenor.com/0SSUr4x0EsMAAAAC/cantwait-milkandmocha.gif', '2023-12-29 07:11:45'),
(2, '6LUsAFzXyzRiyK-Ga6ef-ZoV1wZqpr', 'jal7kd4hd1wRBG2PmJMU', 'Shaq Shimmy GIF', '2048765052329044460', 1312418, 'image/gif', NULL, 'https://media.tenor.com/HG6s9dROqewAAAAC/shaq-shimmy.gif', '2023-12-29 15:27:04');

-- --------------------------------------------------------

--
-- Table structure for table `direct_messages_reactions`
--

CREATE TABLE `direct_messages_reactions` (
  `_id` int NOT NULL,
  `_messageID` char(36) NOT NULL,
  `_uuid` char(36) NOT NULL,
  `displayName` varchar(128) NOT NULL,
  `emoji` varchar(64) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `direct_messages_thread`
--

CREATE TABLE `direct_messages_thread` (
  `_id` int UNSIGNED NOT NULL,
  `_messageID` int NOT NULL,
  `from` char(36) NOT NULL,
  `to` char(36) NOT NULL,
  `content` text NOT NULL,
  `files` json DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `_id` int UNSIGNED NOT NULL,
  `_uuid` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `sessionID` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `connected` int NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`_id`, `_uuid`, `sessionID`, `connected`, `createdAt`, `updatedAt`, `deletedAt`) VALUES
(4, 'jal7kd4hd1wRBG2PmJMU', 'RWxtYWwium1FKTPgvhgIyG2kalShEUgKm-RC', 1, '2023-12-29 15:21:49', '2023-12-29 15:21:49', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `_id` int UNSIGNED NOT NULL,
  `_uuid` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `firstName` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `lastName` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `email` varchar(128) NOT NULL,
  `status` int NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`_id`, `_uuid`, `firstName`, `lastName`, `email`, `status`, `createdAt`, `updatedAt`) VALUES
(1, 'jal7kd4hd1wRBG2PmJMU', 'ahmed', 'atwa', 'atwa@mail.com', 1, '2023-12-07 20:34:34', '2023-12-07 20:34:34'),
(2, 'mJTPA_ms5iG9ENQaYPdN', 'amira', 'mi7s', 'mi7s@mail.com', 1, '2023-12-07 21:21:04', '2023-12-07 21:21:04'),
(6, 'lTkZuX4i_3JL_lkC2h8Z', 'test1', 'test1', 'test1@test.com', 1, '2023-12-12 20:03:53', '2023-12-12 20:03:53'),
(7, '9SmlFM2cWZRg0CTKQSEM', 'test2', 'test2', 'test2@test.com', 1, '2023-12-12 20:05:53', '2023-12-12 20:05:53');

-- --------------------------------------------------------

--
-- Table structure for table `user_downloads`
--

CREATE TABLE `user_downloads` (
  `_id` int NOT NULL,
  `_uuid` char(36) NOT NULL,
  `file_id` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `channels`
--
ALTER TABLE `channels`
  ADD PRIMARY KEY (`_id`),
  ADD UNIQUE KEY `channels__channelid_unique` (`_channelID`),
  ADD UNIQUE KEY `channels_channelname_unique` (`channelName`),
  ADD KEY `channels_createdby_index` (`createdBy`);

--
-- Indexes for table `channel_members`
--
ALTER TABLE `channel_members`
  ADD PRIMARY KEY (`_id`),
  ADD KEY `_channelID` (`_channelID`),
  ADD KEY `_uuid` (`_uuid`);

--
-- Indexes for table `channel_messages`
--
ALTER TABLE `channel_messages`
  ADD PRIMARY KEY (`_id`),
  ADD KEY `channelmessages__channelid_foreign` (`_channelID`),
  ADD KEY `channelmessages_from_foreign` (`from`);

--
-- Indexes for table `channel_messages_files`
--
ALTER TABLE `channel_messages_files`
  ADD PRIMARY KEY (`_id`);

--
-- Indexes for table `channel_messages_reactions`
--
ALTER TABLE `channel_messages_reactions`
  ADD PRIMARY KEY (`_id`),
  ADD KEY `channelmessagesfiles__messageid_foreign` (`_messageID`);

--
-- Indexes for table `channel_messages_thread`
--
ALTER TABLE `channel_messages_thread`
  ADD PRIMARY KEY (`_id`);

--
-- Indexes for table `chat_users_settings`
--
ALTER TABLE `chat_users_settings`
  ADD PRIMARY KEY (`_id`);

--
-- Indexes for table `direct_messages`
--
ALTER TABLE `direct_messages`
  ADD PRIMARY KEY (`_id`),
  ADD KEY `_channelID` (`_channelID`);

--
-- Indexes for table `direct_messages_channels`
--
ALTER TABLE `direct_messages_channels`
  ADD PRIMARY KEY (`_id`),
  ADD UNIQUE KEY `_channelID` (`_channelID`);

--
-- Indexes for table `direct_messages_files`
--
ALTER TABLE `direct_messages_files`
  ADD PRIMARY KEY (`_id`);

--
-- Indexes for table `direct_messages_reactions`
--
ALTER TABLE `direct_messages_reactions`
  ADD PRIMARY KEY (`_id`);

--
-- Indexes for table `direct_messages_thread`
--
ALTER TABLE `direct_messages_thread`
  ADD PRIMARY KEY (`_id`),
  ADD KEY `channelmessagesthread__threadid_foreign` (`_messageID`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`_id`),
  ADD UNIQUE KEY `ch_users_uuid_unique` (`_uuid`),
  ADD KEY `ch_users_uuid_index` (`_uuid`);

--
-- Indexes for table `user_downloads`
--
ALTER TABLE `user_downloads`
  ADD PRIMARY KEY (`_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `channels`
--
ALTER TABLE `channels`
  MODIFY `_id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `channel_members`
--
ALTER TABLE `channel_members`
  MODIFY `_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `channel_messages`
--
ALTER TABLE `channel_messages`
  MODIFY `_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `channel_messages_files`
--
ALTER TABLE `channel_messages_files`
  MODIFY `_id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `channel_messages_reactions`
--
ALTER TABLE `channel_messages_reactions`
  MODIFY `_id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `channel_messages_thread`
--
ALTER TABLE `channel_messages_thread`
  MODIFY `_id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `chat_users_settings`
--
ALTER TABLE `chat_users_settings`
  MODIFY `_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `direct_messages`
--
ALTER TABLE `direct_messages`
  MODIFY `_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `direct_messages_channels`
--
ALTER TABLE `direct_messages_channels`
  MODIFY `_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `direct_messages_files`
--
ALTER TABLE `direct_messages_files`
  MODIFY `_id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `direct_messages_reactions`
--
ALTER TABLE `direct_messages_reactions`
  MODIFY `_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `direct_messages_thread`
--
ALTER TABLE `direct_messages_thread`
  MODIFY `_id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sessions`
--
ALTER TABLE `sessions`
  MODIFY `_id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `_id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `user_downloads`
--
ALTER TABLE `user_downloads`
  MODIFY `_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `direct_messages`
--
ALTER TABLE `direct_messages`
  ADD CONSTRAINT `direct_messages_ibfk_1` FOREIGN KEY (`_channelID`) REFERENCES `direct_messages_channels` (`_channelID`) ON DELETE RESTRICT ON UPDATE RESTRICT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
