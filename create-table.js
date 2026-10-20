
import { pool } from './db.js';

try {
    const result = await pool.query('SELECT * FROM tasks');

    console.log('Tasks currently in the database:', result.rows);
} catch (error) {
    console.error('Database query failed:', error.message);
} finally {
    await pool.end();
}
