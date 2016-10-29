

CREATE TABLE `criteria_types`(
	`id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
	`query_type` CHAR(255) NOT NULL,
    FULLTEXT `query_type` (`query_type`),
	PRIMARY KEY (`id`),
	UNIQUE KEY `id` (`id`)
)ENGINE = MyISAM;


CREATE TABLE `watching_criteria`(
	`id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
	`query_val` CHAR(255) NOT NULL,
	`criteria_type_id` bigint(20) unsigned NOT NULL,
	INDEX `criteria_type_id` (`criteria_type_id`),
	PRIMARY KEY (`id`),
	UNIQUE KEY `id` (`id`)
)ENGINE = MyISAM;




CREATE TABLE `secondary_table`(
	`id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
	`title_text` CHAR(255) NOT NULL,
    FULLTEXT `title_text` (`title_text`),
	PRIMARY KEY (`id`),
	UNIQUE KEY `id` (`id`)
)ENGINE = MyISAM;


CREATE TABLE `log`(
	`id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
	`secondary_id` bigint(20) unsigned NOT NULL,
    `numeric_val` DECIMAL(65,4) NOT NULL,
	`date_modified` DATETIME NOT NULL DEFAULT NOW() ON UPDATE CURRENT_TIMESTAMP,
	INDEX `secondary_id` (`secondary_id`),
	PRIMARY KEY (`id`),
	UNIQUE KEY `id` (`id`)
)ENGINE = MyISAM;
