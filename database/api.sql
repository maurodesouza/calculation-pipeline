drop schema if exists cp cascade;

CREATE SCHEMA cp;

CREATE TABLE cp.pipelines (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,

	canvas JSONB,

    initial_step_id UUID,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cp.steps (
    id UUID PRIMARY KEY,

    pipeline_id UUID REFERENCES cp.pipelines(id),

    name VARCHAR(255),
    description TEXT,

    operation VARCHAR(255) NOT NULL,
    by NUMERIC NOT NULL,

    next_step_id UUID,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cp.runs (
    id UUID PRIMARY KEY,

    pipeline_id UUID REFERENCES cp.pipelines(id),

	payload NUMERIC NOT NULL,
	result NUMERIC,

    status VARCHAR(255) NOT NULL,
    error TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE cp.pipelines
ADD CONSTRAINT fk_pipeline_initial_step
FOREIGN KEY (initial_step_id)
REFERENCES cp.steps(id);
