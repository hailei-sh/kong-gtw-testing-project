const { Pool } = require('pg');

function getDbConfig() {
    if (typeof Cypress !== 'undefined' && Cypress.env) {
        return {
            host: Cypress.env('DB_HOST') || 'localhost',
            port: Cypress.env('DB_PORT') || 5432,
            user: Cypress.env('DB_USER') || 'kong',
            password: Cypress.env('DB_PASS') || 'kong',
            database: Cypress.env('DB_NAME') || 'kong',
        };
    }

    return {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'kong',
        password: process.env.DB_PASS || 'kong',
        database: process.env.DB_NAME || 'kong',
    };
}

const pool = new Pool({
    ...getDbConfig(),
    max: 10,
    idleTimeoutMillis: 30000,
});

async function runQuery(query, params = []) {
    const client = await pool.connect();
    try {
        const res = await client.query(query, params);
        return res.rows;
    } catch (err) {
        console.error('Database query error:', err.message);
        throw err;
    } finally {
        client.release();
    }
}

const ALLOWED_TABLES = [
    'services',
    'routes',
    'consumers',
    'plugins',
    'basicauth_credentials',
];

function validateTableName(table) {
    if (!ALLOWED_TABLES.includes(table)) {
        throw new Error(`Invalid table name: ${table}`);
    }
}

async function deleteFromTable(table, condition = '', params = []) {
    validateTableName(table);
    const query = `DELETE FROM ${table} ${condition}`;
    await runQuery(query, params);
}

async function getById(table, id) {
    validateTableName(table);
    const rows = await runQuery(`SELECT * FROM ${table} WHERE id = $1;`, [id]);
    return rows[0] || null;
}

const db = {
    async deleteBasicAuths() {
        await deleteFromTable('basicauth_credentials', 'WHERE username NOT LIKE $1;', ['kong_admin%']);
    },

    async deleteConsumers() {
        await deleteFromTable('consumers', 'WHERE username NOT LIKE $1;', ['kong_admin%']);
    },

    async deletePlugins() {
        await deleteFromTable('plugins');
    },

    async deleteRoutes() {
        await deleteFromTable('routes');
    },

    async deleteServices() {
        await deleteFromTable('services');
    },

    async getService(id) {
        return await getById('services', id);
    },

    async getRoute(id) {
        return await getById('routes', id);
    },

    async getConsumer(id) {
        return await getById('consumers', id);
    },

    async getBasicAuth(id) {
        return await getById('basicauth_credentials', id);
    },

    async getPlugin(id) {
        return await getById('plugins', id);
    },
};

module.exports = { db, runQuery };