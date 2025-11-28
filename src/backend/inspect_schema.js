const pool = require('./db');

async function inspect() {
    try {
        const [rows] = await pool.query("SHOW COLUMNS FROM applications");
        rows.forEach(row => {
            console.log(`${row.Field} | ${row.Type}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

inspect();
