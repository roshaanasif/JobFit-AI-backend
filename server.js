const app=require('./src/app');
const connectToDB=require('./src/config/db')
const PORT = process.env.PORT || 5000;

connectToDB()

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

