const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const Handlebars = require('handlebars');

// Đăng ký helper limit
Handlebars.registerHelper('limit', function(array, limit) {
    return array.slice(0, limit);
});

// Cấu hình session
app.use(session({
    secret: 'your_secret_key',  // Chìa khóa bí mật để mã hóa session
    resave: false,              // Không lưu lại session nếu không có thay đổi
    saveUninitialized: true,    // Lưu session mới ngay cả khi chưa có giá trị
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // Thời gian sống của cookie (1 ngày)
    }
}));

const EmployeeRoute = require("./src/routes/Employee/indexRoutes");
const CustomerRoute = require("./src/routes/Customer/indexRoutes");
const AdminRoute = require("./src/routes/Admin/indexRoutes");
const UnloginRoute = require("./src/routes/Unlogin/indexRoutes");
const { Module } = require('module');
const dishController = require('./src/modules/Employee/dish/dishController');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Handlebars
const hbsInstance = exphbs.create({
    extname: '.hbs',
    defaultLayout: 'main', // Layout chính
    layoutsDir: path.join(__dirname, 'src', 'views', 'layouts'),
    partialsDir: [
        path.join(__dirname, 'src', 'views', 'partials', 'Unlogin'),
        path.join(__dirname, 'src', 'views', 'partials', 'Customer'),
        path.join(__dirname, 'src', 'views', 'partials', 'Employee'),
        path.join(__dirname, 'src', 'views', 'partials', 'Admin'),
    ],
    helpers: {
      formatTime: (time) => {
        if (!time) return 'N/A';
        const date = new Date(time);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        return `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
      },
      limit: function (array, limit) {
        return array.slice(0, limit);
      },
      eq: function (a, b, options) {
        if (a === b) {
          return options.fn(this); // Nếu bằng nhau thì render phần trong {{#eq}}
        } else {
          return options.inverse ? options.inverse(this) : ''; // Nếu không bằng thì render phần trong {{else}}, nếu có
        }
      },
      ifCond: function (v1, v2, options) {
        if (v1 === v2) {
          return options.fn(this); // Nếu v1 == v2, render nội dung bên trong {{#ifCond}}
        } else {
          return options.inverse(this); // Nếu v1 != v2, render phần {{else}}, nếu có
        }
      },
      isEqual: function (a, b) {
        return a === b; // Trả về true/false
      },
    },
});
app.engine('hbs', hbsInstance.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'src', 'views'))

app.use(express.static(path.join(__dirname, 'src', 'public')));

CustomerRoute(app);
EmployeeRoute(app);
UnloginRoute(app);
AdminRoute(app);
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// MVC


