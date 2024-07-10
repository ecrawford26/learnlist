-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 04, 2024 at 09:30 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `learnlistsdb`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`) VALUES
(1, 'Basic Spanish'),
(2, 'Gardening'),
(3, 'Plumbing a Sink'),
(4, 'REACTJS');

-- --------------------------------------------------------

--
-- Table structure for table `learnlists`
--

CREATE TABLE `learnlists` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `learnlists`
--

INSERT INTO `learnlists` (`id`, `name`, `description`, `image_path`, `created_by`, `created_at`) VALUES
(1, 'Learnlist 1', 'Description for Learnlist 1', NULL, 23, '2024-06-19 15:33:45'),
(2, 'Learnlist 2', 'Description for Learnlist 2', NULL, 23, '2024-06-19 15:33:45'),
(3, 'Learnlist 3', 'Description for Learnlist 3', NULL, 23, '2024-06-19 15:33:45');

-- --------------------------------------------------------

--
-- Table structure for table `resources`
--

CREATE TABLE `resources` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `URL` varchar(255) NOT NULL,
  `details` text DEFAULT NULL,
  `category_id` int(11) NOT NULL,
  `resource_type_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `resources`
--

INSERT INTO `resources` (`id`, `name`, `URL`, `details`, `category_id`, `resource_type_id`) VALUES
(1, 'Spanish for Beginners', 'https://spanishforbeginners.com', 'An introductory course on basic Spanish.', 1, 1),
(2, 'Advanced Spanish Grammar', 'https://advancedspanish.com', 'A deep dive into Spanish grammar rules.', 1, 1),
(3, 'Gardening 101', 'https://gardening101.com', 'Basic gardening techniques for beginners.', 2, 1),
(4, 'Planting Flowers', 'https://plantingflowers.com', 'A guide to planting and maintaining flowers.', 2, 1),
(5, 'Fixing a Leaky Faucet', 'https://fixfaucet.com', 'Step-by-step guide to fixing a leaky faucet.', 3, 1),
(6, 'Sink Installation', 'https://sinkinstallation.com', 'Instructions for installing a new sink.', 3, 1),
(7, 'Intro to REACTJS', 'https://introreactjs.com', 'Getting started with REACTJS framework.', 4, 1),
(8, 'Advanced REACTJS', 'https://advancedreactjs.com', 'Advanced concepts and features of REACTJS.', 4, 1),
(9, 'Spanish Vocabulary Building', 'https://spanishvocabulary.com', 'Learn essential Spanish vocabulary.', 1, 2),
(10, 'Spanish Pronunciation Guide', 'https://spanishpronunciation.com', 'Tips and exercises for perfecting your Spanish pronunciation.', 1, 3),
(11, 'Vegetable Gardening Tips', 'https://vegetablegardening.com', 'Tips for starting and maintaining a vegetable garden.', 2, 2),
(12, 'Pest Control in Gardens', 'https://gardenpestcontrol.com', 'Methods for controlling pests in your garden.', 2, 3),
(13, 'Plumbing a Sink Installation', 'https://sinkinstallation.com', 'Instructions for plumbing a new sink.', 3, 2),
(14, 'Fixing Plumbing Issues', 'https://fixplumbing.com', 'Guide to fixing common plumbing issues.', 3, 3),
(15, 'REACTJS Component Lifecycle', 'https://reactcomponentlifecycle.com', 'Understanding the component lifecycle in REACTJS.', 4, 2),
(16, 'REACTJS State Management', 'https://reactstatemanagement.com', 'Managing state in REACTJS applications.', 4, 3),
(17, 'Spanish Conversation Practice', 'https://spanishconversation.com', 'Practice speaking Spanish with native speakers.', 1, 2),
(18, 'Spanish Idioms and Expressions', 'https://spanishidioms.com', 'Learn common Spanish idioms and expressions.', 1, 3),
(19, 'Spanish Listening Exercises', 'https://spanishlistening.com', 'Improve your Spanish listening skills.', 1, 2),
(20, 'Spanish Reading Comprehension', 'https://spanishreading.com', 'Exercises to enhance Spanish reading comprehension.', 1, 3),
(21, 'Spanish Writing Tips', 'https://spanishwriting.com', 'Tips and exercises for writing in Spanish.', 1, 2),
(22, 'Organic Gardening Basics', 'https://organicgardening.com', 'Introduction to organic gardening methods.', 2, 2),
(23, 'Herb Gardening Guide', 'https://herbgardening.com', 'Guide to growing and using herbs.', 2, 3),
(24, 'Container Gardening', 'https://containergardening.com', 'How to grow plants in containers.', 2, 2),
(25, 'Seasonal Gardening Tips', 'https://seasonalgardening.com', 'Gardening tips for different seasons.', 2, 3),
(26, 'Soil Preparation Techniques', 'https://soilpreparation.com', 'Techniques for preparing soil for planting.', 2, 2),
(27, 'Replacing Sink Faucets', 'https://replacesinkfaucets.com', 'Guide to replacing sink faucets.', 3, 2),
(28, 'Unclogging Drains', 'https://uncloggingdrains.com', 'Methods for unclogging sink drains.', 3, 3),
(29, 'Installing a Garbage Disposal', 'https://installgarbagedisposal.com', 'Steps to install a garbage disposal.', 3, 2),
(30, 'Fixing Low Water Pressure', 'https://fixlowwaterpressure.com', 'Solutions for low water pressure issues.', 3, 3),
(31, 'Leak Detection Tips', 'https://leakdetection.com', 'Tips for detecting leaks in your plumbing.', 3, 2),
(32, 'REACTJS Hooks Introduction', 'https://reactjshooks.com', 'Introduction to hooks in REACTJS.', 4, 2),
(33, 'Styling in REACTJS', 'https://reactjsstyling.com', 'Techniques for styling REACTJS components.', 4, 3),
(34, 'REACTJS with TypeScript', 'https://reactjstypescript.com', 'Using TypeScript with REACTJS.', 4, 2),
(35, 'Testing REACTJS Applications', 'https://reactjstesting.com', 'Approaches for testing REACTJS applications.', 4, 3),
(36, 'Deploying REACTJS Apps', 'https://deployreactjs.com', 'Best practices for deploying REACTJS applications.', 4, 2),
(37, 'Intermediate Spanish', 'https://intermediatespanish.com', 'A course for intermediate-level Spanish learners.', 1, 1),
(38, 'Spanish Verb Conjugation', 'https://spanishverbs.com', 'Mastering Spanish verb conjugation.', 1, 1),
(39, 'Conversational Spanish', 'https://conversationalspanish.com', 'Improving your Spanish conversation skills.', 1, 1),
(40, 'Advanced Gardening Techniques', 'https://advancedgardening.com', 'Advanced methods and techniques for gardening.', 2, 1),
(41, 'Organic Gardening Course', 'https://organicgardeningcourse.com', 'Comprehensive course on organic gardening.', 2, 1),
(42, 'Urban Gardening', 'https://urbangardening.com', 'How to garden in urban environments.', 2, 1),
(43, 'Complete Plumbing Course', 'https://plumbingcourse.com', 'A complete course on plumbing for home improvement.', 3, 1),
(44, 'Plumbing Basics', 'https://plumbingbasics.com', 'Learn the basics of plumbing.', 3, 1),
(45, 'Advanced Plumbing', 'https://advancedplumbing.com', 'Advanced techniques and tips for plumbing.', 3, 1),
(46, 'REACTJS Fundamentals', 'https://reactjsfundamentals.com', 'A course on the fundamentals of REACTJS.', 4, 1),
(47, 'Building REACTJS Apps', 'https://buildreactjsapps.com', 'Learn to build applications with REACTJS.', 4, 1),
(48, 'REACTJS Advanced Concepts', 'https://reactjsadvanced.com', 'Advanced concepts in REACTJS development.', 4, 1);

-- --------------------------------------------------------

--
-- Table structure for table `resource_types`
--

CREATE TABLE `resource_types` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `resource_types`
--

INSERT INTO `resource_types` (`id`, `name`) VALUES
(2, 'Book'),
(1, 'Online Course'),
(3, 'Video');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `learnlist_id` int(11) DEFAULT NULL,
  `rating` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `user_id`, `learnlist_id`, `rating`, `created_at`, `updated_at`) VALUES
(6, 23, 1, 5, '2024-06-19 15:33:56', '2024-06-19 15:33:56'),
(7, 23, 2, 4, '2024-06-19 15:33:56', '2024-06-19 15:33:56'),
(8, 23, 3, 3, '2024-06-19 15:33:56', '2024-06-19 15:33:56'),
(11, 16, 15, 2, '2024-06-19 15:51:20', '2024-06-19 15:51:20'),
(12, 16, 14, 2, '2024-06-19 15:54:43', '2024-06-19 15:54:43'),
(13, 16, 14, 3, '2024-06-19 15:54:45', '2024-06-19 15:54:45'),
(14, 16, 16, 3, '2024-06-19 15:58:36', '2024-06-19 15:58:36'),
(15, 24, 2, 2, '2024-06-19 16:54:06', '2024-06-19 16:54:06'),
(18, 24, 14, 2, '2024-06-21 09:58:28', '2024-06-21 09:58:28'),
(19, 25, 13, 2, '2024-07-02 15:30:50', '2024-07-02 15:30:50'),
(23, 25, 1, 2, '2024-07-04 19:26:24', '2024-07-04 19:26:24');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `email`, `created_at`) VALUES
(1, 'testuser', 'password', 'testuser@example.com', '2024-06-13 13:42:15'),
(2, 'admin', 'password', 'admin@example.com', '2024-06-13 13:44:57'),
(3, 'me', '$2a$10$pEfUl8.ktDU8VmoHDb3Q2ODqScUB5HIyvnRlVQdOD6B5uk9fD810e', 'emm@gfj', '2024-06-13 14:56:20'),
(4, 'hfhyhy', '$2a$10$eQ8lfwYWuJ8ABLWNE87GDOboiqks..fsS5y0ioqgGTlkfXFR2W3F2', 'dfdh@hfgh', '2024-06-13 16:48:20'),
(5, 'rgdg', '$2a$10$Ar9SJlwFW0PGsLuKad4O4Ojg7R07H7Ng5qEM45H36I.7Bjyrx1MC.', 'fgdgf@gfdg', '2024-06-13 16:57:50'),
(6, 'sdfds', '$2a$10$M7iMK3T6ARwlDZNYSkIn5uZnKQs5gCZHQenfIyD68ZMB1SYBmwmrW', 'dsfs@dsnfkd', '2024-06-13 17:00:15'),
(7, 'dsf', '$2a$10$nyfJb3Y05wC9OE5EdvKgL.qqQS8YOVOWysP4NefOxwPNsm8D8Ceyy', 'dfs1@dfs', '2024-06-13 17:14:30'),
(8, 'fsffgd', '$2a$10$w.4vHk73P049fCZ0iHj60.AIaXR0BY98p8QTBun1cy33W8eQU1Fe.', 'dfgndk@fdgnj', '2024-06-13 17:22:13'),
(9, 'dfsf', '$2a$10$2piWRi6v1wGsu1YDFLwKEemtpIGtGvnWx9zzFnlVWoi7KSXIXqxE6', 'dsf@DSg', '2024-06-13 17:25:46'),
(10, 'ethan', '$2a$10$sVdnb/B1uaJD9gmgE1O6w.ovxOvw1nPOfCCnLKsQTrTVaGLbEJDkS', 'ethan@gmail.com', '2024-06-13 17:28:45'),
(11, 'j', '$2a$10$dAhDzKKBjkKvIu9cyCL9Puo5iA3uYigNJNe1LOzFh2BYCk/z4s.8i', 'j@j', '2024-06-13 17:29:42'),
(12, 'dsklfnsdk', '$2a$10$y8RPd4fXWEbPP8b28CQUeOcOLiUOpqv0YzyXnD5HSwhcKItv7HjKq', 'dsfjks@dnsjkf', '2024-06-14 16:13:12'),
(13, 'eydf', '$2a$10$eFYeRoqSz21y1WmF1VUgrOwTGQmlxNtDqHqDoIuzxeZrhGi.2INKO', 'fgdfh@Fdhd', '2024-06-17 17:29:13'),
(14, 'r', '$2a$10$8vaJdTyUp.CtLQANQQDyRudmUQdMmaFWelvIxr1Hgnw0gqjNssVLy', 'r@gmail', '2024-06-17 17:45:10'),
(15, 'john', '$2a$10$q3GbuFviIjK2sh0/AP3QX.0XvWS4Hb9h4qoWaAu3I0YasL2d5eDkW', 'j@m', '2024-06-18 09:35:20'),
(16, 'rowan', '$2a$10$xLgMbkI170A9yl./L2B19.z030fdb20hWOd5vmM5k6sqsZm8d6lt.', 'r@m', '2024-06-18 09:45:31'),
(17, 'jm', '$2a$10$r2FLecup1RapLrpgTCw0w.UcIbhv2l7XG6CXQjN6eM.jCnQP4QxbK', 'hm@g', '2024-06-18 09:48:24'),
(18, 'new', '$2a$10$Z1DBGqBvfRl6u3ZBv37EY.PJAClH7Io0edUCa/3eKSJQDGXNOZ6OW', 'n@g', '2024-06-18 09:51:06'),
(19, 'a', '$2a$10$Pa3jJlrikkJNo0KDw9UNguPym8Q/jNgajBqs3zTIhlvuxkhllLgyW', 'a@b', '2024-06-18 09:54:20'),
(20, 'b', '$2a$10$gc0dDzXPKw0/uS37I6tZTuNanFDuIgEIDvgxHXQIRlWdomsB6hk0e', 'b@m', '2024-06-18 10:04:03'),
(21, 't', '$2a$10$LIxAsukszWw/br.fQyCXWOTXcT558fn6hPzJhW9RneUOZrGxVsxlS', 't@h', '2024-06-18 10:09:08'),
(22, 'e', '$2a$10$qB3/KxVkMrlpxECFxditVeXAfQu3q35X41I/y9qifcgFGewJd7khi', 'e@t', '2024-06-18 10:13:18'),
(23, 'hi', '$2a$10$Jnv4/vlXloS..9QkVpChVuzIM3uSB9VANawBcuoUivF8T9Q3cQ0vi', 'hi@gmail.com', '2024-06-19 14:41:46'),
(24, 'Sarah', '$2a$10$V3tuOkF2.pkvEpC/mX2O0uiHL0d.psxXcHG4CvbgPUUJgXnUdZeAK', 'sarah@gmail.com', '2024-06-19 16:53:29'),
(25, 'Abbie', '$2a$10$fMiGdvWnejChvFwdN74jfeCEbh33rQTBmv0t5OlBXNIjwtbwCKMg2', 'abbie@gmail.com', '2024-07-02 15:14:20');

-- --------------------------------------------------------

--
-- Table structure for table `user_favourites`
--

CREATE TABLE `user_favourites` (
  `user_id` int(11) NOT NULL,
  `learnlist_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_favourites`
--

INSERT INTO `user_favourites` (`user_id`, `learnlist_id`) VALUES
(24, 2),
(25, 1);

-- --------------------------------------------------------

--
-- Table structure for table `user_learnlists`
--

CREATE TABLE `user_learnlists` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_learnlists`
--

INSERT INTO `user_learnlists` (`id`, `user_id`, `name`, `description`, `created_at`, `updated_at`) VALUES
(1, 19, 'efdsf', 'dsfsdf', '2024-06-18 15:32:36', '2024-06-18 15:32:36'),
(2, 19, 'dsnfksf', 'fbdfbd', '2024-06-18 15:33:42', '2024-06-18 15:33:42'),
(3, 19, 'my', 'my ll', '2024-06-18 15:42:04', '2024-06-18 15:42:04'),
(5, 19, 'ufguyi', 'dsvjk', '2024-06-19 14:35:23', '2024-06-19 14:35:23'),
(13, 23, 'Hi\'s List', 'his ', '2024-06-19 15:42:01', '2024-06-19 15:42:01'),
(14, 16, 'efdsg', 'dfs', '2024-06-19 15:46:19', '2024-06-19 15:46:19'),
(15, 16, 'dfs', 'dsvsdv', '2024-06-19 15:47:40', '2024-06-19 15:47:40'),
(16, 16, 'fd', 'dfsf', '2024-06-19 15:58:32', '2024-06-19 15:58:32'),
(20, 24, 'Sarah\'s Spanish', 'spa', '2024-06-21 11:22:55', '2024-06-21 11:22:55');

-- --------------------------------------------------------

--
-- Table structure for table `user_learnlist_resources`
--

CREATE TABLE `user_learnlist_resources` (
  `id` int(11) NOT NULL,
  `user_learnlist_id` int(11) NOT NULL,
  `resource_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_learnlist_resources`
--

INSERT INTO `user_learnlist_resources` (`id`, `user_learnlist_id`, `resource_id`) VALUES
(1, 2, 9),
(4, 3, 11),
(26, 13, 1),
(27, 13, 2),
(28, 14, 1),
(29, 14, 7),
(30, 15, 1),
(31, 15, 2),
(32, 16, 1),
(33, 16, 3),
(42, 20, 1),
(43, 20, 2);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `learnlists`
--
ALTER TABLE `learnlists`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `resources`
--
ALTER TABLE `resources`
  ADD PRIMARY KEY (`id`),
  ADD KEY `resources_ibfk_3` (`category_id`),
  ADD KEY `resources_ibfk_2` (`resource_type_id`);

--
-- Indexes for table `resource_types`
--
ALTER TABLE `resource_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name_UNIQUE` (`name`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `learnlist_id` (`learnlist_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_favourites`
--
ALTER TABLE `user_favourites`
  ADD PRIMARY KEY (`user_id`,`learnlist_id`),
  ADD KEY `learnlist_id` (`learnlist_id`);

--
-- Indexes for table `user_learnlists`
--
ALTER TABLE `user_learnlists`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `user_learnlist_resources`
--
ALTER TABLE `user_learnlist_resources`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_pair` (`user_learnlist_id`,`resource_id`),
  ADD KEY `user_learnlist_id` (`user_learnlist_id`),
  ADD KEY `resource_id` (`resource_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `learnlists`
--
ALTER TABLE `learnlists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `resources`
--
ALTER TABLE `resources`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT for table `resource_types`
--
ALTER TABLE `resource_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `user_learnlists`
--
ALTER TABLE `user_learnlists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `user_learnlist_resources`
--
ALTER TABLE `user_learnlist_resources`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=68;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `learnlists`
--
ALTER TABLE `learnlists`
  ADD CONSTRAINT `learnlists_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `resources`
--
ALTER TABLE `resources`
  ADD CONSTRAINT `resources_ibfk_2` FOREIGN KEY (`resource_type_id`) REFERENCES `resource_types` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `resources_ibfk_3` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`learnlist_id`) REFERENCES `user_learnlists` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_favourites`
--
ALTER TABLE `user_favourites`
  ADD CONSTRAINT `user_favourites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `user_favourites_ibfk_2` FOREIGN KEY (`learnlist_id`) REFERENCES `user_learnlists` (`id`);

--
-- Constraints for table `user_learnlists`
--
ALTER TABLE `user_learnlists`
  ADD CONSTRAINT `user_learnlists_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_learnlist_resources`
--
ALTER TABLE `user_learnlist_resources`
  ADD CONSTRAINT `user_learnlist_resources_ibfk_1` FOREIGN KEY (`user_learnlist_id`) REFERENCES `user_learnlists` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_learnlist_resources_ibfk_2` FOREIGN KEY (`resource_id`) REFERENCES `resources` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
