const { Sequelize } = require('sequelize');
const dotenv = require('dotenv')

dotenv.config({path:'./config.env'})
const connectionStr = `postgres://${process.env.PG_USERNAME}:${process.env.PG_PASSWORD}@${process.env.PG_HOST}:${process.env.PG_PORT}/${process.env.PG_DATABASE}?sslmode=require`;
// const sequelize = new Sequelize(connectionStr, {
//     dialect: 'postgres',
//     dialectOptions: {
//       ssl: {
//         require: true,
//         rejectUnauthorized: false
//       }
//     },
//   });
const sequelize = new Sequelize(process.env.PG_DATABASE, process.env.PG_USERNAME, process.env.PG_PASSWORD, {
    host: process.env.PG_HOST,
    port: process.env.PG_PORT || 11970,
    dialect: 'postgres',
    logging: false, 
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: true,
        ca: `
-----BEGIN CERTIFICATE-----
MIIEQTCCAqmgAwIBAgIUNBzG83WgQAPkbs6aQWi+U2m0WhgwDQYJKoZIhvcNAQEM
BQAwOjE4MDYGA1UEAwwvN2FmZGUzMDUtOTk5Yi00NWQ0LTk1YWItNmZjZWI4YTE1
MzAzIFByb2plY3QgQ0EwHhcNMjQxMTA2MTIyOTI3WhcNMzQxMTA0MTIyOTI3WjA6
MTgwNgYDVQQDDC83YWZkZTMwNS05OTliLTQ1ZDQtOTVhYi02ZmNlYjhhMTUzMDMg
UHJvamVjdCBDQTCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCCAYoCggGBAJAwJmh4
3RQvzzaRzaG52aE5Ou6OER5rfsfZVZHhdH+eMeZc/hPot/f8nqDtK4IKcNRkf8UM
QsTLpcGs3Tk+bAUMxX77zJbsuv6QjVuNS3YOG9ynrhqmAwk+239oCRAIzbrmVKsk
WqwuB0cwnSEJr6GUswOlIuQAPIHHbje1E8pCspril2uvH0rgaXBxIXRZS0ASRn+L
b9prg1K6DL1em8CmfBw8iRSgYAIJBYCWQaj4b67uOYFzorBkptEgnc2QcrHNTgEi
h86d6Yh42g+c1ZKCaZrt4rx5RehsQ8UhlunDxGzqFZHDSffq7J4mytLwKGMgS/Dh
eCJr2EmtegVs0VJVgBVg8u+rrj/1kvmVW8fB2EB9b0pvX9raJrXBAhHlOHynBYL2
R1oHNpQVZFS+v4QUz9j3YSC29dpiMqEjwwpjJXzkBHtWepAcavpwlvfFIcralRiF
3Fv4OiKPDrpYdFfmz8Q3FnuXXFb2HoQ8D5EJ6yfCSA45Xb5zNcMCxg3+kwIDAQAB
oz8wPTAdBgNVHQ4EFgQU3qm/z9i9UkeEFSv04c9Ca1H+/5swDwYDVR0TBAgwBgEB
/wIBADALBgNVHQ8EBAMCAQYwDQYJKoZIhvcNAQEMBQADggGBAC5+6b6BFqHNB1Hn
KE/YwSiGwVZzINBIKsxpHfEthui80djOx6SBShYc+ZYEvqp8sQM0IJTwSKZ6Vt42
IoDcENxdPfTKCu2Rbnt/rQL8c4hjZwaZ5FfRlqUm2vegpH3lx/V3cLjRu2gMTLGB
dlpjNQNp8GJn13iSy5vektT8YEwXZ7VwkfY5xpm0TzXMfvw8iXLia48xpPnb/4K2
/iQV+WN96Ip9lxme+i8ZV9RZ31mN/Za4tdnlcQenPjjV0HGBm3QOp8Ij7+djI3L+
Bixt82yQFS3H+dSWQPsRTbXo4BVD2R4fG5Jafqmu0yB8+X/OlIvlzZU+2jbUEELQ
erjm6B7AyYruF0ICA+e+QVh4T8xH6kH6hKcXV+fsoesbKvmuYdq6raoEfNdWJw2U
CqCE9X9xmB2CSe+Qs+2xeH4Qqc8Jk/1Gk5j6wA0C3gUXhijevEETvbeFrfYYUwkT
7eH8QcjTEh7gk77iv1ZhVpApE1Fqofo2lcOfqE7dSo9Vt9VeLw==
-----END CERTIFICATE-----`
      }
    }
})
module.exports = sequelize;
 