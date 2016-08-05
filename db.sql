-- phpMyAdmin SQL Dump
-- version 4.4.10
-- http://www.phpmyadmin.net
--
-- Host: localhost:3306
-- Generation Time: Aug 05, 2016 at 01:40 AM
-- Server version: 5.5.42
-- PHP Version: 5.6.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Database: `heroku_efb4405c4b34c93`
--

-- --------------------------------------------------------

--
-- Table structure for table `files`
--

CREATE TABLE `files` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `info` text NOT NULL,
  `location` varchar(550) NOT NULL,
  `author` varchar(255) NOT NULL,
  `project_id` varchar(255) NOT NULL,
  `user_id` varchar(255) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `files`
--

INSERT INTO `files` (`id`, `title`, `info`, `location`, `author`, `project_id`, `user_id`) VALUES
(43, 'allbikes_documentation_updated.pdf', 'pdf', 'uploads/1469786924383.pdf', '', '8', '10'),
(44, 'Untitled-1.svg', 'txt', 'uploads/1469787262695.svg', '', '8', '10');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `sent` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `message_body` text NOT NULL,
  `project_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` varchar(500) NOT NULL,
  `status` varchar(255) NOT NULL,
  `project_colour` varchar(255) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` varchar(55) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`id`, `title`, `description`, `status`, `project_colour`, `start_date`, `end_date`) VALUES
(8, 'Utasko', 'Utasko is a web application designed to streamline project management through task management, file sharing and messaging', 'active', 'blue', '2016-06-17', '28 Aug 2016'),
(19, 'alskjdlkasjd', '', 'active', 'purple', '2016-07-29', '29 Jul 2016'),
(21, 'Tester Project', '', 'active', 'turquoise', '2016-07-29', ''),
(22, 'Test', '', 'active', 'turquoise', '2016-07-30', '17 Aug 2016');

-- --------------------------------------------------------

--
-- Table structure for table `project_users`
--

CREATE TABLE `project_users` (
  `project_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `project_users`
--

INSERT INTO `project_users` (`project_id`, `user_id`) VALUES
(8, 10),
(15, 10),
(16, 10),
(17, 10),
(18, 10),
(19, 13),
(20, 10),
(21, 10),
(22, 15);

-- --------------------------------------------------------

--
-- Table structure for table `repository`
--

CREATE TABLE `repository` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `author` varchar(255) NOT NULL,
  `link` varchar(500) NOT NULL,
  `project_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `requirement`
--

CREATE TABLE `requirement` (
  `id` int(11) NOT NULL,
  `description` varchar(255) NOT NULL,
  `status` varchar(55) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=77 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `requirement`
--

INSERT INTO `requirement` (`id`, `description`, `status`) VALUES
(57, 'Send Messages', ''),
(58, 'Append New Message', ''),
(59, 'Save Messages to Database', ''),
(60, 'Notify users of messages', ''),
(61, 'asdasd', ''),
(62, 'aslkdjalskjd', ''),
(63, 'asdasd', ''),
(64, 'asdasd', ''),
(65, 'Send Messages', ''),
(66, 'Append New Message', ''),
(67, 'Save Messages to Database', ''),
(68, 'Notify Users of New Message', ''),
(69, 'Dynamic Icons', ''),
(70, 'Delete Files', ''),
(71, 'Redirect after uploading', ''),
(72, 'Include API', ''),
(73, 'Display Branches and Commits', ''),
(74, 'Manage Repository (edit and delete)', ''),
(75, 'Save state of complete tasks', ''),
(76, 'Save state of complete requirements', '');

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `start_date` varchar(55) NOT NULL,
  `end_date` varchar(55) NOT NULL,
  `completed` varchar(55) NOT NULL,
  `author` varchar(255) NOT NULL,
  `status` text NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=83 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`id`, `title`, `description`, `start_date`, `end_date`, `completed`, `author`, `status`) VALUES
(78, 'Create Chat System', 'Create a chat system to allow users to communicate with one another about a project', '2016-07-29', '05 Aug 2016', '', '', 'active'),
(79, 'Files List', 'Finalise file list functionality', '2016-07-29', '31 Jul 2016', '', '', 'active'),
(80, 'Uploads Functionality', 'Finalise uploads functionality', '2016-07-29', '31 Jul 2016', '', '', 'active'),
(81, 'Repository Functionlity', 'Incorporate GitHub repository API', '2016-07-29', '05 Aug 2016', '', '', 'active'),
(82, 'Task Functionality', 'Finalise task functionality', '2016-07-29', '05 Aug 2016', '', '', 'active');

-- --------------------------------------------------------

--
-- Table structure for table `tasks_project`
--

CREATE TABLE `tasks_project` (
  `task_id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `tasks_project`
--

INSERT INTO `tasks_project` (`task_id`, `project_id`) VALUES
(73, 8),
(74, 8),
(75, 8),
(78, 8),
(79, 8),
(80, 8),
(81, 8),
(82, 8);

-- --------------------------------------------------------

--
-- Table structure for table `task_requirements`
--

CREATE TABLE `task_requirements` (
  `task_id` int(11) NOT NULL,
  `requirement_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `task_requirements`
--

INSERT INTO `task_requirements` (`task_id`, `requirement_id`) VALUES
(73, 57),
(73, 58),
(73, 59),
(73, 60),
(74, 61),
(75, 62),
(76, 63),
(77, 64),
(78, 65),
(78, 66),
(78, 67),
(78, 68),
(79, 69),
(79, 70),
(80, 71),
(81, 72),
(81, 73),
(81, 74),
(82, 75),
(82, 76);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(500) NOT NULL,
  `profile_image` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `name`, `email`, `profile_image`, `password`) VALUES
(10, 'Stuie', 'stuart.mitchelhill@gmail.com', 'images/profile_images/1469787480060.jpg', 'password'),
(15, 'tester', 'test@tester.com', 'images/profile_images/user_icon.png', 'test');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `files`
--
ALTER TABLE `files`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `project_users`
--
ALTER TABLE `project_users`
  ADD PRIMARY KEY (`project_id`,`user_id`);

--
-- Indexes for table `repository`
--
ALTER TABLE `repository`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `requirement`
--
ALTER TABLE `requirement`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tasks_project`
--
ALTER TABLE `tasks_project`
  ADD PRIMARY KEY (`task_id`,`project_id`);

--
-- Indexes for table `task_requirements`
--
ALTER TABLE `task_requirements`
  ADD PRIMARY KEY (`task_id`,`requirement_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `files`
--
ALTER TABLE `files`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=45;
--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `projects`
--
ALTER TABLE `projects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=23;
--
-- AUTO_INCREMENT for table `repository`
--
ALTER TABLE `repository`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `requirement`
--
ALTER TABLE `requirement`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=77;
--
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=83;
--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=16;