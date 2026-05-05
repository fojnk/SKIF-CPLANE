CREATE TABLE t_user(
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE t_user_group(
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE t_user_group_match(
    user_id INTEGER NOT NULL REFERENCES t_user(id),
    user_group_id INTEGER NOT NULL REFERENCES t_user_group(id),
    UNIQUE (user_id, user_group_id)
);

CREATE TABLE t_role(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    idm_id VARCHAR(255) NOT NULL DEFAULT 'unknown'
);

CREATE TABLE t_rule(
    id SERIAL PRIMARY KEY,
    object_type VARCHAR(63) NOT NULL DEFAULT '',
    object_id INTEGER NOT NULL,
    action VARCHAR(5) NOT NULL,
    object_attribute VARCHAR(63) NOT NULL DEFAULT ''
);

CREATE TABLE t_role_match(
    rule_id INTEGER NOT NULL REFERENCES t_rule(id),
    role_id INTEGER NOT NULL REFERENCES t_role(id),
    UNIQUE (rule_id, role_id)
);

CREATE TABLE t_acl_match(
    id SERIAL PRIMARY KEY,
    user_group_id INTEGER REFERENCES t_user_group(id),
    user_id INTEGER REFERENCES t_user(id) ON DELETE CASCADE,
    rule_id INTEGER REFERENCES t_rule(id),
    role_id INTEGER REFERENCES t_role(id),
    CHECK (
        (
            (user_group_id IS NOT NULL) :: INTEGER +
            (user_id IS NOT NULL) :: INTEGER
        ) = 1
        AND
        (
            (rule_id IS NOT NULL) :: INTEGER +
            (role_id IS NOT NULL) :: INTEGER
        ) = 1
    ),
    UNIQUE (user_group_id, rule_id),
    UNIQUE (user_group_id, role_id),
    UNIQUE (user_id, rule_id),
    UNIQUE (user_id, role_id)
);

CREATE TABLE t_user_rule(
    user_id INTEGER NOT NULL REFERENCES t_user(id) ON DELETE CASCADE,
    rule_id INTEGER NOT NULL REFERENCES t_rule(id),
    acl_match_id INTEGER NOT NULL REFERENCES t_acl_match(id) ON DELETE CASCADE
);

CREATE TABLE t_namespace(
    id SERIAL PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    namespace_version_id INTEGER,
    unlimited BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE t_project (
    id SERIAL PRIMARY KEY,
    namespace_id INTEGER NOT NULL REFERENCES t_namespace(id),
    name VARCHAR(128) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    project_version_id INTEGER,
    unlimited BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT now(),
    abc_product_id VARCHAR(255) NOT NULL DEFAULT ''
);

CREATE TABLE t_experiment_template(
    id SERIAL PRIMARY KEY,
    namespace_id INTEGER NOT NULL REFERENCES t_namespace(id),
    name VARCHAR(128) NOT NULL,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT DEFAULT '' NOT NULL
);

CREATE TABLE t_experiment_template_v(
    id SERIAL PRIMARY KEY,
    parent_id INTEGER NOT NULL REFERENCES t_experiment_template(id),
    version_id INTEGER NOT NULL,
    YQL TEXT NOT NULL,
    config TEXT,
    config_patch TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT (timezone('utc', now())),
    comment TEXT NOT NULL DEFAULT '',
    creator TEXT NOT NULL DEFAULT 'unknown',
    additional_information JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE t_dataset(
    id SERIAL PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    type VARCHAR(64) NOT NULL DEFAULT 'Queue',
    params TEXT NOT NULL DEFAULT '',
    schema TEXT NOT NULL DEFAULT '',
    namespace_id INTEGER REFERENCES t_namespace(id),
    is_external BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    public BOOLEAN NOT NULL DEFAULT FALSE,
    managed BOOLEAN NOT NULL DEFAULT FALSE,
    project_id INTEGER REFERENCES t_project(id) DEFAULT NULL,
    updated_at TIMESTAMP DEFAULT now(),
    version_id INTEGER DEFAULT 0 NOT NULL
);

CREATE TABLE t_experiment(
    id SERIAL PRIMARY KEY,
    template_v_id INTEGER NOT NULL REFERENCES t_experiment_template_v(id),
    project_id INTEGER NOT NULL REFERENCES t_project(id),
    status TEXT NOT NULL DEFAULT 'idle',
    orch_id varchar(32),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    unlimited BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE t_experiment_io(
    id SERIAL PRIMARY KEY,
    experiment_id INTEGER NOT NULL REFERENCES t_experiment(id),
    ds_type VARCHAR(3) NOT NULL,
    ds_id INTEGER NOT NULL REFERENCES t_dataset(id)
);

CREATE TABLE t_project_config_v(
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES t_project(id) ON DELETE CASCADE,
    version_id INTEGER NOT NULL,
    config JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT (timezone('utc', now()))
);

CREATE TABLE t_namespace_config_v(
    id SERIAL PRIMARY KEY,
    namespace_id INTEGER NOT NULL REFERENCES t_namespace(id) ON DELETE CASCADE,
    version_id INTEGER NOT NULL,
    config JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT (timezone('utc', now()))
);

ALTER TABLE t_project ADD CONSTRAINT fk_t_project_project_version_id FOREIGN KEY (project_version_id) REFERENCES t_project_config_v(id);
ALTER TABLE t_namespace ADD CONSTRAINT fk_t_namespace_namespace_version_id FOREIGN KEY (namespace_version_id) REFERENCES t_namespace_config_v(id);

CREATE TABLE t_experiment_dataset (
    id SERIAL PRIMARY KEY,
    experiment_id INT NOT NULL REFERENCES t_experiment(id),
    dataset_id INT NOT NULL REFERENCES t_dataset(id),
    alias TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE t_namespace_update_log (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT (timezone('utc', now())),
    namespace_id INT NOT NULL,
    username VARCHAR(255) NOT NULL,
    act VARCHAR(255) NOT NULL,
    details JSONB,
    comment TEXT NOT NULL DEFAULT ''
);

CREATE TABLE t_project_update_log (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT (timezone('utc', now())),
    namespace_id INT NOT NULL,
    project_id INT NOT NULL,
    username VARCHAR(255) NOT NULL,
    act VARCHAR(255) NOT NULL,
    details JSONB,
    comment TEXT NOT NULL DEFAULT ''
);

CREATE TABLE t_dataset_update_log (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT (timezone('utc', now())),
    namespace_id INT NOT NULL,
    dataset_id INT NOT NULL,
    username VARCHAR(255) NOT NULL,
    act VARCHAR(255) NOT NULL,
    details JSONB,
    project_id INTEGER REFERENCES t_project(id) DEFAULT NULL,
    comment TEXT NOT NULL DEFAULT ''
);

CREATE TABLE t_experiment_update_log (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT (timezone('utc', now())),
    project_id INT NOT NULL,
    experiment_id INT NOT NULL,
    username VARCHAR(255) NOT NULL,
    act VARCHAR(255) NOT NULL,
    details JSONB,
    comment TEXT NOT NULL DEFAULT ''
);

CREATE TABLE t_experiment_variable (
    id SERIAL PRIMARY KEY,
    experiment_id INT NOT NULL REFERENCES t_experiment(id),
    name VARCHAR(255) NOT NULL,
    value TEXT NOT NULL DEFAULT '',
    type VARCHAR(255) NOT NULL DEFAULT 'string',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    version_id INTEGER DEFAULT 0 NOT NULL,
    UNIQUE (experiment_id, name)
);

CREATE TABLE t_experiment_status (
    id SERIAL PRIMARY KEY,
    experiment_id INTEGER NOT NULL REFERENCES t_experiment(id) ON DELETE CASCADE,
    current_version INTEGER NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    orch_config TEXT NOT NULL DEFAULT '',
    UNIQUE (experiment_id)
);

CREATE TABLE t_app_banner (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL DEFAULT 'info',
    title VARCHAR(255) NOT NULL DEFAULT '',
    message TEXT NOT NULL DEFAULT '',
    active BOOLEAN NOT NULL DEFAULT FALSE,
    color VARCHAR(20) NOT NULL DEFAULT '#FF0000',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    color_dark VARCHAR(20) NOT NULL DEFAULT '',
    starts TIMESTAMP NULL,
    ends TIMESTAMP NULL
);

CREATE TABLE robot_tokens (
    id SERIAL PRIMARY KEY,
    robot_id INTEGER NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL
);

CREATE TABLE t_user_pinned_projects (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    project_id INTEGER NOT NULL,
    pinned_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES t_user(id) ON DELETE CASCADE,
    CONSTRAINT fk_project FOREIGN KEY (project_id) REFERENCES t_project(id) ON DELETE CASCADE,
    CONSTRAINT unique_user_project UNIQUE (user_id, project_id)
);

CREATE TABLE t_role_owner (
    role_id INTEGER REFERENCES t_role(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES t_user(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, user_id)
);

CREATE TABLE t_role_object_match (
    id SERIAL PRIMARY KEY,
    role_id INTEGER NOT NULL REFERENCES t_role(id) ON DELETE CASCADE,
    role_type VARCHAR(50) NOT NULL,
    object_type VARCHAR(50) NOT NULL,
    object_id INTEGER NOT NULL,
    UNIQUE(role_id, object_type, object_id, role_type)
);

CREATE TABLE t_experiment_variable_v (
    id SERIAL PRIMARY KEY,
    variable_id INTEGER REFERENCES t_experiment_variable(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    value TEXT NOT NULL DEFAULT '',
    type VARCHAR(255) NOT NULL DEFAULT 'string',
    comment VARCHAR(255) NOT NULL DEFAULT '',
    creator VARCHAR(255) NOT NULL DEFAULT 'unknown',
    created_at TIMESTAMP NOT NULL DEFAULT (timezone('utc', now()))
);

CREATE TABLE t_dataset_v (
    id SERIAL PRIMARY KEY,
    dataset_id INTEGER REFERENCES t_dataset(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    params TEXT NOT NULL DEFAULT '',
    schema TEXT NOT NULL DEFAULT '',
    public BOOLEAN NOT NULL DEFAULT FALSE,
    managed BOOLEAN NOT NULL DEFAULT FALSE,
    type VARCHAR(64) NOT NULL DEFAULT 'Queue',
    comment VARCHAR(255) NOT NULL DEFAULT '',
    creator VARCHAR(255) NOT NULL DEFAULT 'unknown',
    created_at TIMESTAMP NOT NULL DEFAULT (timezone('utc', now()))
);

CREATE TABLE t_cubes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    author VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '' NOT NULL,
    base_id INT REFERENCES t_cubes(id) ON DELETE CASCADE,
    params_name VARCHAR(255) NOT NULL,
    params JSONB NOT NULL,
    type VARCHAR(128) NOT NULL DEFAULT 'CIT_CUBE',
    CONSTRAINT c_unique_cube_name UNIQUE (name)
);

CREATE TABLE t_app_updates (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    video_url TEXT,
    image_url TEXT,
    release_date TIMESTAMP NOT NULL,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE t_app_about (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL DEFAULT '',
    links TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE t_app_upcoming (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_name ON t_user(name);
CREATE INDEX idx_user_group_name ON t_user_group(name);
CREATE INDEX idx_project_config_v_project_id_version_id ON t_project_config_v(project_id, version_id);
CREATE INDEX idx_namespace_config_v_namespace_id_version_id ON t_namespace_config_v(namespace_id, version_id);
CREATE INDEX idx_namespace_update_log_namespace_id ON t_namespace_update_log(namespace_id);
CREATE INDEX idx_namespace_update_log_created_at ON t_namespace_update_log(created_at);
CREATE INDEX idx_project_update_log_namespace_id ON t_project_update_log(namespace_id);
CREATE INDEX idx_project_update_log_project_id ON t_project_update_log(project_id);
CREATE INDEX idx_project_update_log_created_at ON t_project_update_log(created_at);
CREATE INDEX idx_dataset_update_log_namespace_id ON t_dataset_update_log(namespace_id);
CREATE INDEX idx_dataset_update_log_dataset_id ON t_dataset_update_log(dataset_id);
CREATE INDEX idx_dataset_update_log_created_at ON t_dataset_update_log(created_at);
CREATE INDEX idx_experiment_update_log_project_id ON t_experiment_update_log(project_id);
CREATE INDEX idx_experiment_update_log_experiment_id ON t_experiment_update_log(experiment_id);
CREATE INDEX idx_experiment_update_log_created_at ON t_experiment_update_log(created_at);
CREATE INDEX idx_experiment_variable_experiment_id ON t_experiment_variable(experiment_id);
CREATE INDEX idx_idm_id ON t_role(idm_id);
CREATE INDEX idx_app_updates_release_date ON t_app_updates(release_date DESC);
CREATE INDEX idx_app_updates_is_published ON t_app_updates(is_published);

ALTER TABLE t_experiment ADD CONSTRAINT orch_id_unique UNIQUE (orch_id);
ALTER TABLE t_user ADD CONSTRAINT c_unique_user_username UNIQUE (name);
ALTER TABLE t_role ADD CONSTRAINT c_role_unique_name UNIQUE (name);
ALTER TABLE t_rule ADD CONSTRAINT c_unique_rule UNIQUE (object_type, object_attribute, object_id, action);
ALTER TABLE t_experiment_dataset ADD CONSTRAINT c_unique_alias UNIQUE (alias, experiment_id);

CREATE UNIQUE INDEX c_namespace_unique_name ON t_namespace(name) WHERE deleted IS NULL;
CREATE UNIQUE INDEX c_project_unique_name ON t_project(name, namespace_id) WHERE deleted IS NULL;
CREATE UNIQUE INDEX c_experiment_unique_name ON t_experiment_template(name, namespace_id) WHERE deleted IS NULL;
CREATE UNIQUE INDEX c_dataset_unique_name ON t_dataset(name, namespace_id) WHERE deleted IS NULL;
CREATE UNIQUE INDEX c_unique_dataset_name_in_project ON t_dataset(project_id, name) WHERE deleted = FALSE;

CREATE OR REPLACE VIEW v_real_namespace AS SELECT * FROM t_namespace WHERE deleted = FALSE;
CREATE OR REPLACE VIEW v_real_project AS SELECT * FROM t_project WHERE deleted = FALSE;
CREATE OR REPLACE VIEW v_real_dataset AS SELECT * FROM t_dataset WHERE deleted = FALSE;
CREATE OR REPLACE VIEW v_real_experiment AS SELECT * FROM t_experiment WHERE deleted = FALSE;
CREATE OR REPLACE VIEW v_real_experiment_template AS SELECT * FROM t_experiment_template WHERE deleted = FALSE;

CREATE OR REPLACE FUNCTION safe_jsonb_parse(text) RETURNS jsonb AS $$
BEGIN
    RETURN $1::jsonb;
EXCEPTION WHEN others THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION update_project_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE t_project SET updated_at = now()
    WHERE id = NEW.project_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION add_rule_to_role()
RETURNS TRIGGER AS $add_rule_to_role$
BEGIN
    INSERT INTO t_user_rule(user_id, rule_id, acl_match_id)
    SELECT t_acl_match.user_id, NEW.rule_id, t_acl_match.id FROM t_acl_match
    WHERE t_acl_match.user_id IS NOT NULL AND t_acl_match.role_id = NEW.role_id;

    INSERT INTO t_user_rule(user_id, rule_id, acl_match_id)
    SELECT t_user_group_match.user_id, NEW.rule_id, t_acl_match.id FROM t_user_group_match
    JOIN t_acl_match ON t_user_group_match.user_group_id = t_acl_match.user_group_id
    WHERE t_acl_match.role_id = NEW.role_id;

    RETURN NEW;
END;
$add_rule_to_role$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION add_role_to_user_group()
RETURNS TRIGGER AS $add_role_to_user_group$
BEGIN
    INSERT INTO t_user_rule(user_id, rule_id, acl_match_id)
    SELECT t_user_group_match.user_id, t_role_match.rule_id, t_acl_match.id FROM t_user_group_match
    JOIN t_acl_match ON t_acl_match.user_group_id = t_user_group_match.user_group_id
    JOIN t_role_match ON t_acl_match.role_id = t_role_match.role_id
    WHERE t_acl_match.user_group_id = NEW.user_group_id
      AND t_acl_match.role_id = NEW.role_id;
    RETURN NEW;
END;
$add_role_to_user_group$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION add_role_to_user()
RETURNS TRIGGER AS $add_role_to_user$
BEGIN
    INSERT INTO t_user_rule(user_id, rule_id, acl_match_id)
    SELECT NEW.user_id, t_role_match.rule_id, NEW.id FROM t_role_match
    WHERE t_role_match.role_id = NEW.role_id;
    RETURN NEW;
END;
$add_role_to_user$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION add_rule_to_user()
RETURNS TRIGGER AS $add_rule_to_user$
BEGIN
    INSERT INTO t_user_rule(user_id, rule_id, acl_match_id)
    VALUES(NEW.user_id, NEW.rule_id, NEW.id);
    RETURN NEW;
END;
$add_rule_to_user$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION add_rule_to_user_group()
RETURNS TRIGGER AS $add_rule_to_user_group$
BEGIN
    INSERT INTO t_user_rule(user_id, rule_id, acl_match_id)
    SELECT t_user_group_match.user_id, NEW.rule_id, NEW.id FROM t_user_group_match
    WHERE t_user_group_match.user_group_id = NEW.user_group_id;
    RETURN NEW;
END;
$add_rule_to_user_group$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION add_user_to_user_group()
RETURNS TRIGGER AS $add_user_to_user_group$
BEGIN
    INSERT INTO t_user_rule(user_id, rule_id, acl_match_id)
    SELECT NEW.user_id, t_acl_match.rule_id, t_acl_match.id FROM t_acl_match
    WHERE t_acl_match.rule_id IS NOT NULL AND t_acl_match.user_group_id = NEW.user_group_id;

    INSERT INTO t_user_rule(user_id, rule_id, acl_match_id)
    SELECT NEW.user_id, t_role_match.rule_id, t_acl_match.id FROM t_role_match
    JOIN t_acl_match ON t_role_match.role_id = t_acl_match.role_id
    WHERE t_acl_match.user_group_id = NEW.user_group_id;

    RETURN NEW;
END;
$add_user_to_user_group$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION remove_rule_from_role()
RETURNS TRIGGER AS $remove_rule_from_role$
BEGIN
    DELETE FROM t_user_rule WHERE (user_id, rule_id, acl_match_id) IN (
        SELECT t_acl_match.user_id, OLD.rule_id, t_acl_match.id FROM t_acl_match
        WHERE t_acl_match.user_id IS NOT NULL
          AND t_acl_match.role_id = OLD.role_id
    );

    DELETE FROM t_user_rule WHERE (user_id, rule_id, acl_match_id) IN (
        SELECT t_user_group_match.user_id, OLD.rule_id, t_acl_match.id FROM t_user_group_match
        JOIN t_acl_match ON t_user_group_match.user_group_id = t_acl_match.user_group_id
        WHERE t_acl_match.role_id = OLD.role_id
    );

    RETURN OLD;
END;
$remove_rule_from_role$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION remove_role_from_user_group()
RETURNS TRIGGER AS $remove_role_from_user_group$
BEGIN
    DELETE FROM t_user_rule WHERE (user_id, rule_id, acl_match_id) IN (
        SELECT t_user_group_match.user_id, t_role_match.rule_id, OLD.id FROM t_user_group_match
        JOIN t_acl_match ON t_acl_match.user_group_id = t_user_group_match.user_group_id
        JOIN t_role_match ON t_acl_match.role_id = t_role_match.role_id
        WHERE t_acl_match.user_group_id = OLD.user_group_id
          AND t_acl_match.role_id = OLD.role_id
    );

    RETURN OLD;
END;
$remove_role_from_user_group$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION remove_role_from_user()
RETURNS TRIGGER AS $remove_role_from_user$
BEGIN
    DELETE FROM t_user_rule WHERE (user_id, rule_id, acl_match_id) IN (
        SELECT OLD.user_id, t_role_match.rule_id, OLD.id FROM t_role_match
        WHERE t_role_match.role_id = OLD.role_id
    );

    RETURN OLD;
END;
$remove_role_from_user$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION remove_rule_from_user()
RETURNS TRIGGER AS $remove_rule_from_user$
BEGIN
    DELETE FROM t_user_rule WHERE (user_id, rule_id, acl_match_id) IN (
        VALUES (OLD.user_id, OLD.rule_id, OLD.id)
    );

    RETURN OLD;
END;
$remove_rule_from_user$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION remove_rule_from_user_group()
RETURNS TRIGGER AS $remove_rule_from_user_group$
BEGIN
    DELETE FROM t_user_rule WHERE (user_id, rule_id, acl_match_id) IN (
        SELECT t_user_group_match.user_id, OLD.rule_id, OLD.id FROM t_user_group_match
        WHERE t_user_group_match.user_group_id = OLD.user_group_id
    );

    RETURN OLD;
END;
$remove_rule_from_user_group$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION remove_user_from_user_group()
RETURNS TRIGGER AS $remove_user_from_user_group$
BEGIN
    DELETE FROM t_user_rule WHERE (user_id, rule_id, acl_match_id) IN (
        SELECT OLD.user_id, t_acl_match.rule_id, t_acl_match.id FROM t_acl_match
        WHERE t_acl_match.rule_id IS NOT NULL AND t_acl_match.user_group_id = OLD.user_group_id
    );

    DELETE FROM t_user_rule WHERE (user_id, rule_id, acl_match_id) IN (
        SELECT OLD.user_id, t_role_match.rule_id, t_acl_match.id FROM t_role_match
        JOIN t_acl_match ON t_role_match.role_id = t_acl_match.role_id
        WHERE t_acl_match.user_group_id = OLD.user_group_id
    );

    RETURN OLD;
END;
$remove_user_from_user_group$ LANGUAGE plpgsql;

CREATE TRIGGER new_rule_to_role
AFTER INSERT ON t_role_match
FOR EACH ROW
EXECUTE FUNCTION add_rule_to_role();

CREATE TRIGGER new_role_to_user_group
AFTER INSERT ON t_acl_match
FOR EACH ROW
WHEN (NEW.user_group_id IS NOT NULL AND NEW.role_id IS NOT NULL)
EXECUTE FUNCTION add_role_to_user_group();

CREATE TRIGGER new_role_to_user
AFTER INSERT ON t_acl_match
FOR EACH ROW
WHEN (NEW.user_id IS NOT NULL AND NEW.role_id IS NOT NULL)
EXECUTE FUNCTION add_role_to_user();

CREATE TRIGGER new_rule_to_user_group
AFTER INSERT ON t_acl_match
FOR EACH ROW
WHEN (NEW.user_group_id IS NOT NULL AND NEW.rule_id IS NOT NULL)
EXECUTE FUNCTION add_rule_to_user_group();

CREATE TRIGGER new_rule_to_user
AFTER INSERT ON t_acl_match
FOR EACH ROW
WHEN (NEW.user_id IS NOT NULL AND NEW.rule_id IS NOT NULL)
EXECUTE FUNCTION add_rule_to_user();

CREATE TRIGGER new_user_to_user_group
AFTER INSERT ON t_user_group_match
FOR EACH ROW
EXECUTE FUNCTION add_user_to_user_group();

CREATE TRIGGER delete_rule_from_role
BEFORE DELETE ON t_role_match
FOR EACH ROW
EXECUTE FUNCTION remove_rule_from_role();

CREATE TRIGGER delete_role_from_user_group
BEFORE DELETE ON t_acl_match
FOR EACH ROW
WHEN (OLD.user_group_id IS NOT NULL AND OLD.role_id IS NOT NULL)
EXECUTE FUNCTION remove_role_from_user_group();

CREATE TRIGGER delete_role_from_user
BEFORE DELETE ON t_acl_match
FOR EACH ROW
WHEN (OLD.user_id IS NOT NULL AND OLD.role_id IS NOT NULL)
EXECUTE FUNCTION remove_role_from_user();

CREATE TRIGGER delete_rule_from_user_group
BEFORE DELETE ON t_acl_match
FOR EACH ROW
WHEN (OLD.user_group_id IS NOT NULL AND OLD.rule_id IS NOT NULL)
EXECUTE FUNCTION remove_rule_from_user_group();

CREATE TRIGGER delete_rule_from_user
BEFORE DELETE ON t_acl_match
FOR EACH ROW
WHEN (OLD.user_id IS NOT NULL AND OLD.rule_id IS NOT NULL)
EXECUTE FUNCTION remove_rule_from_user();

CREATE TRIGGER delete_user_from_user_group
BEFORE DELETE ON t_user_group_match
FOR EACH ROW
EXECUTE FUNCTION remove_user_from_user_group();

CREATE TRIGGER trg_experiment_update
BEFORE UPDATE ON t_experiment
FOR EACH ROW
EXECUTE FUNCTION update_project_timestamp();

CREATE TRIGGER trg_dataset_update
BEFORE UPDATE ON t_dataset
FOR EACH ROW
EXECUTE FUNCTION update_project_timestamp();

ALTER TABLE t_user ADD COLUMN is_robot BOOLEAN DEFAULT FALSE;
ALTER TABLE t_user ADD COLUMN last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL;
ALTER TABLE t_user ADD COLUMN deleted BOOLEAN DEFAULT FALSE NOT NULL;

INSERT INTO t_app_about (id, content, links, updated_at)
VALUES (1, '', '', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

INSERT INTO t_app_upcoming (id, content, updated_at)
VALUES (1, '', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;
