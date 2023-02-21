const express = require('express'), app = express(), cors = require('cors'),
      {init} = require('./data/main.js'), router = require('./controller/main.js')

app.use(express.json());
app.use(cors());
app.use(router);

init();

if (process.env.ENV === 'test') {
    module.exports = app;
}
else {
    app.listen(process.env.PORT);
}