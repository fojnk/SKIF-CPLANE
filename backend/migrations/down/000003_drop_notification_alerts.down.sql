CREATE TABLE t_products
(
    product_id integer NOT NULL UNIQUE CHECK (product_id >= 0),
    PRIMARY KEY (product_id)
);

CREATE TABLE t_alert_groups
(
    alert_group_id integer NOT NULL GENERATED ALWAYS AS IDENTITY UNIQUE,
    product_id integer NOT NULL CHECK (product_id >= 0),
    experiment_id integer NOT NULL,
    PRIMARY KEY (alert_group_id),
    UNIQUE (product_id, experiment_id)
);

CREATE TABLE t_alert_rules
(
    alert_group_id integer NOT NULL,
    template_alert_id integer NOT NULL,
    rule_id integer NOT NULL GENERATED ALWAYS AS IDENTITY UNIQUE,
    severity_name varchar NOT NULL,
    severity_is_active bool NOT NULL,
    alert_limit varchar NOT NULL,
    delay_firing varchar NOT NULL,
    delay_resolving varchar NOT NULL,
    PRIMARY KEY (rule_id)
);

ALTER TABLE t_alert_rules
    ADD CONSTRAINT fk_t_alert_groups_to_t_alert_rules
    FOREIGN KEY (alert_group_id)
    REFERENCES t_alert_groups (alert_group_id)
    ON DELETE CASCADE;
ALTER TABLE t_alert_groups
    ADD CONSTRAINT fk_t_products_to_t_alert_groups
    FOREIGN KEY (product_id)
    REFERENCES t_products (product_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE;
ALTER TABLE t_alert_groups
    ADD CONSTRAINT fk_t_experiment_to_t_alert_groups
    FOREIGN KEY (experiment_id)
    REFERENCES t_experiment (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE;
