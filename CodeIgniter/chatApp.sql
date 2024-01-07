-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jan 07, 2024 at 08:07 PM
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
  `topic` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `settings` json DEFAULT NULL,
  `visible` tinyint(1) NOT NULL,
  `connected` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
  ADD KEY `channelmessagesfiles__messageid_foreign` (`_messageID`),
  ADD KEY `_channelID` (`_channelID`);

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
  MODIFY `_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `channel_messages`
--
ALTER TABLE `channel_messages`
  MODIFY `_id` int NOT NULL AUTO_INCREMENT;

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
  MODIFY `_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `direct_messages_channels`
--
ALTER TABLE `direct_messages_channels`
  MODIFY `_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `direct_messages_files`
--
ALTER TABLE `direct_messages_files`
  MODIFY `_id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `direct_messages_reactions`
--
ALTER TABLE `direct_messages_reactions`
  MODIFY `_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

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
-- Constraints for table `channel_messages_reactions`
--
ALTER TABLE `channel_messages_reactions`
  ADD CONSTRAINT `channel_messages_reactions_ibfk_1` FOREIGN KEY (`_messageID`) REFERENCES `channel_messages` (`_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
