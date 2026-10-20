import { pool } from './db.js';

try {
    const result = await pool.query('SELECT NOW()');

    console.log('Database connected successfully!');
    console.log('Database time:', result.rows[0].now);
} catch (error) {
    console.error('Database connection failed!');
    console.dir(error, { depth: 3 });
} finally {
    await pool.end();
}