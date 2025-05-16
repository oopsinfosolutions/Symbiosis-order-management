const express = require("express");
const cors = require("cors");
const sequelize = require("./config/db");
require("dotenv").config();
const SignUp = require('./models/SignUp');

const app = express();
app.use(cors());
app.use(express.json());

const orderRoutes = require("./routes/orderRoutes");
const concernedPersonsRoute = require('./routes/concernedPerson');

// Mount routes
app.use('/api', orderRoutes);
app.use('/api/concerned-persons', concernedPersonsRoute);


// Signup
app.post('/Signup', async (req, res) => {
  const { fullName, email, Emp_id, phone, password } = req.body;


  const sql = `
    INSERT INTO SignUps (fullName, email, Emp_id, phone, password, type) 
    VALUES (?, ?, ?, ?, ?, "user")
  `;

  try {
    await sequelize.query(sql, { replacements: [fullName, email, Emp_id, phone, password] });
    res.json({ success: true, message: 'Signup successful!' });
  } catch (err) {
    console.error("Error during signup:", err);
    res.json({ success: false, message: 'Signup failed. Please try again.' });
  }
});

// Check Emp_id
app.post('/checkEmpId', async (req, res) => {
  const { Emp_id } = req.body;
  const sql = `SELECT COUNT(*) AS count FROM SignUps WHERE Emp_id = ?`;

  try {
    const [results] = await sequelize.query(sql, { replacements: [Emp_id] });
    const isAvailable = results[0].count === 0;
    res.json({ available: isAvailable });
  } catch (err) {
    console.error("Error checking Emp_id:", err);
    res.status(500).json({ message: 'Error checking Emp_id' });
  }
});

// Login
app.post('/Login', async (req, res) => {
  const { Emp_id, password } = req.body;
  const sql = `SELECT * FROM SignUps WHERE Emp_id = ?`;

  try {
    const [results] = await sequelize.query(sql, { replacements: [Emp_id] });
    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid Employee ID or password' });
    }

    const user = results[0];
    const passwordMatch = user.password === password;

    if (passwordMatch) {
      res.json(user);
    } else {
      res.status(401).json({ error: 'Invalid Employee ID or password' });
    }
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/AdminLogin', async (req, res) => {
    const { email, password } = req.body;

    const query = `SELECT * FROM SignUps WHERE email = ?`;

    try {
        const [results] = await sequelize.query(query, {
            replacements: [email]
        });

        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = results[0];
        const passwordMatch = user.password === password;

        if (passwordMatch && user.type === 'admin') {
            res.json(user);
        } else {
            res.status(401).json({ error: 'Invalid email, password, or user type' });
        }
    } catch (err) {
        console.error("AdminLogin error:", err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.delete("/deleteUsers/:id", async(req, res) => {
    const { id } = req.params;

    try {
        const sql = "DELETE FROM SignUps WHERE Emp_id = ?";
        sequelize.query(sql, [id], (err, result) => {
            if (err) {
                console.error("Error deleting user:", err.message);
                return res.status(500).json({ success: false, message: "Server error. Unable to delete user." });
            }

            if (result.affectedRows > 0) {
                res.status(200).json({ success: true, message: "User deleted successfully." });
            } else {
                res.status(404).json({ success: false, message: "User not found." });
            }
        });
    } catch (error) {
        console.error("Error deleting user:", error.message);
        res.status(500).json({ success: false, message: "Server error. Unable to delete user." });
    }
});

app.get('/Listusers', async (req, res) => {
  try {
    const users = await SignUp.findAll({
      where: { type: 'user' },
      attributes: ['Emp_id', 'fullName', 'email', 'phone']
    });

    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
});

  

app.put('/updateusers', (req, res) => {
    const { Emp_id, fullName, email, phone, password } = req.body;

    if (!Emp_id || !fullName || !email) {
        return res.json({ success: false, message: 'All required fields must be provided.' });
    }

    const sql = password ?
        `
            UPDATE SignUps 
            SET fullName = ?, email = ?, phone = ?, password = ? 
            WHERE Emp_id = ?
          ` :
        `
            UPDATE SignUps 
            SET fullName = ?, email = ?, phone = ? 
            WHERE Emp_id = ?
          `;

    const params = password ? [fullName, email, phone, password, Emp_id] : [fullName, email, phone, Emp_id];

    sequelize.query(sql, params, (err, result) => {
        if (err) {
            console.error("Error updating user:", err);
            return res.json({ success: false, message: 'Database error occurred while updating user.' });
        }

        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'User updated successfully!' });
        } else {
            res.json({ success: false, message: 'No user found with the provided Employee ID.' });
        }
    });
});


// Sync database and start server
sequelize.sync().then(() => {
  console.log("Database synced");
  app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
}).catch(err => {
  console.error("Failed to sequelizeect to DB:", err);
});
