
CREATE TABLE `tweets`(
	`id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
	`tweet_id` bigint(20) unsigned NOT NULL,
    `tweet_text` TEXT NOT NULL,
    `tweet_html` TEXT NOT NULL,
	`date_modified` DATETIME NOT NULL DEFAULT NOW() ON UPDATE CURRENT_TIMESTAMP,
	INDEX `tweet_id` (`tweet_id`),
	PRIMARY KEY (`id`),
	UNIQUE KEY `id` (`id`)
)ENGINE = MyISAM;


CREATE TABLE `criteria_types`(
	`id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
	`query_type` CHAR(255) NOT NULL,
	`api_prefix` CHAR(255) NULL,
	`api_suffix` CHAR(255) NULL,
    FULLTEXT `query_type` (`query_type`),
	PRIMARY KEY (`id`),
	UNIQUE KEY `id` (`id`)
)ENGINE = MyISAM;


CREATE TABLE `criteria`(
	`id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
	`query_val` CHAR(255) NOT NULL,
	`criteria_type_id` bigint(20) unsigned NOT NULL,
	INDEX `criteria_type_id` (`criteria_type_id`),
	PRIMARY KEY (`id`),
	UNIQUE KEY `id` (`id`)
)ENGINE = MyISAM;


CREATE TABLE `criteria_index`(
	`tweet_id` bigint(20) unsigned NOT NULL,
	INDEX `tweet_id` (`tweet_id`),
	`criteria_type_id` bigint(20) unsigned NOT NULL,
	INDEX `criteria_type_id` (`criteria_type_id`)
)ENGINE = MyISAM;


CREATE TABLE `emoji`(
	`id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
	`emoji_val` CHAR(1) NOT NULL,
	PRIMARY KEY (`id`),
	UNIQUE KEY `id` (`id`)
)ENGINE = MyISAM;


CREATE TABLE `emoji_index`(
	`tweet_id` bigint(20) unsigned NOT NULL,
	INDEX `tweet_id` (`tweet_id`),
	`emoji_id` bigint(20) unsigned NOT NULL,
	INDEX `emoji_id` (`emoji_id`)
)ENGINE = MyISAM;




INSERT INTO `criteria_types` VALUES ('1', 'hashtag', '#', NULL), ('2', 'quote', '"', '"');
INSERT INTO `criteria` VALUES (NULL, "POTUS", 1),(NULL, "POTUS", 2);
