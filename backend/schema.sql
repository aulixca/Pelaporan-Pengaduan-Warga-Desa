CREATE DATABASE IF NOT EXISTS `pelaporan_desa` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `pelaporan_desa`;

CREATE TABLE IF NOT EXISTS `categories` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `icon` VARCHAR(100) NOT NULL,
  `color` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `reports` (
  `id` VARCHAR(50) NOT NULL,
  `userId` VARCHAR(50) NOT NULL,
  `userName` VARCHAR(150) NOT NULL,
  `title` VARCHAR(250) NOT NULL,
  `description` TEXT NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `location` VARCHAR(250) NOT NULL,
  `status` ENUM('menunggu','diproses','selesai','ditolak') NOT NULL DEFAULT 'menunggu',
  `photos` LONGTEXT NOT NULL,
  `progress` LONGTEXT NOT NULL,
  `adminNote` TEXT NULL,
  `alasan_penolakan` TEXT NULL,
  `createdAt` VARCHAR(50) NOT NULL,
  `updatedAt` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `passwordHash` VARCHAR(255) NOT NULL,
  `role` ENUM('warga','admin') NOT NULL DEFAULT 'warga',
  `nik` VARCHAR(20) NULL,
  `phone` VARCHAR(30) NULL,
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `userId` VARCHAR(36) NOT NULL,
  `tokenHash` VARCHAR(255) NOT NULL,
  `expiresAt` DATETIME NOT NULL,
  `usedAt` DATETIME NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_password_reset_user` (`userId`),
  KEY `idx_password_reset_expiry` (`expiresAt`),
  CONSTRAINT `fk_password_reset_user`
    FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `categories` (`id`, `name`, `icon`, `color`) VALUES
  ('1', 'Infrastruktur', 'Construction', '#3b82f6'),
  ('2', 'Kebersihan', 'Trash2', '#10b981'),
  ('3', 'Keamanan', 'Shield', '#ef4444'),
  ('4', 'Pelayanan', 'Users', '#f59e0b'),
  ('5', 'Kesehatan', 'Heart', '#ec4899'),
  ('6', 'Pendidikan', 'GraduationCap', '#8b5cf6'),
  ('7', 'Lainnya', 'MoreHorizontal', '#6b7280');

INSERT IGNORE INTO `users` (`id`, `name`, `email`, `passwordHash`, `role`, `nik`, `phone`, `isActive`) VALUES
  ('1', 'Admin Desa', 'admin@desa.id', 'admin123', 'admin', NULL, '081234567890', 1),
  ('2', 'Budi Santoso', 'budi@email.com', 'budi123', 'warga', '3201010101010001', '081234567891', 1),
  ('3', 'Siti Rahayu', 'siti@email.com', 'siti123', 'warga', '3201010101010002', '081234567892', 1);
