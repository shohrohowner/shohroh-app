require('dotenv').config();
const { Admin } = require('./db/models');
const sequelize = require('./db/config');

const DEFAULT_ADMIN = {
    username: 'saycoko',
    password: 'R6r25ey38t_'
};

async function createAdmin() {
    try {
        // Test database connection
        await sequelize.authenticate();
        console.log('✅ Database connection successful');

        // Force sync to recreate tables
        await sequelize.sync({ force: true });
        console.log('✅ Database tables recreated');

        // Create admin user
        const admin = await Admin.create(DEFAULT_ADMIN);
        console.log('✅ Admin user created:', {
            id: admin.id,
            username: admin.username,
            passwordHash: admin.password.substring(0, 20) + '...'
        });
        
        console.log('\n=== Admin Credentials ===');
        console.log('👤 Username:', DEFAULT_ADMIN.username);
        console.log('🔑 Password:', DEFAULT_ADMIN.password);
        console.log('\nℹ️  Please save these credentials!');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

createAdmin(); 