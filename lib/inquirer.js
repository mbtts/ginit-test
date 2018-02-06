const inquirer = require('inquirer');
const files = require('./files');
const minimist = require('minimist');

function createValidator(fieldDescription) {
    return function (value) {
        if (value.length) {
            return true;
        } else {
            return `Please enter ${fieldDescription}.`;
        }
    }
}

module.exports = {
    askGithubCredentials: () => {
        const questions = [
            {
                name: 'username',
                type: 'input',
                message: 'Enter your GitHub username or e-mail address:',
                validate: createValidator('your username or e-mail address.')
            },
            {
                name: 'password',
                type: 'password',
                message: 'Enter your password:',
                validate: createValidator('your password')
            }
        ]

        return inquirer.prompt(questions);
    },

    askRepositoryDetails: () => {
        const argv = minimist(process.argv.slice(2));
        const questions = [
            {
                type: 'input',
                name: 'name',
                message: 'Enter a name for the repository',
                default: argv._[0] || files.getCurrentDirectoryBase(),
                validate: createValidator('a name for the repository.')
            },
            {
                type: 'input',
                name: 'description',
                default: argv._[1] || null,
                message: 'Optionally enter a description of the repository.'
            },
            {
                type: 'list',
                name: 'visibility',
                message: 'Public or private:',
                choices: ['public', 'private'],
                default: 'public'
            }
        ]

        return inquirer.prompt(questions);
    },
 
    askIgnoreFiles: (fileList) => {
        const questions = [
            {
                type: 'checkbox',
                name: 'ignore',
                message: 'Select the files and/or folders you wish to ignore:',
                choices: fileList,
                defailt: ['node_modules', 'bower_components'],
            }
        ];

        return inquirer.prompt(questions);
    }
}
