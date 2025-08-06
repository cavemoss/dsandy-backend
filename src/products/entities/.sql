CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    subdomain VARCHAR NOT NULL,
    supplier SMALLINT NOT NULL,
    scrape_uid VARCHAR(36) NOT NULL,

    ali_product_id BIGINT NULL,
    in_stock BOOLEAN NOT NULL,

    title VARCHAR NOT NULL,
    category VARCHAR NOT NULL,
    description VARCHAR NOT NULL,
    description_html VARCHAR NOT NULL,
    gallery JSON NOT NULL,
    specifications JSON NOT NULL,

    variants JSON NOT NULL,
    variants_size JSON NOT NULL,

    feedback_info JSON NOT NULL,
    delivery_info JSON NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_products_subdomain ON products (subdomain);
CREATE INDEX idx_products_ali_product_id ON products (ali_product_id);