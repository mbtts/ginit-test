const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const files = require('./lib/files');
const github = require('./lib/github')
const inquirer = require('./lib/inquirer');
const repo = require('./lib/repo');

const printBanner = () => {
    const text = figlet.textSync('Ginit', {
        horizontalLayout: 'full'
    });
    console.log(chalk.yellow(text));
};

const checkForRepository = () => {
    if (files.directoryExists('.git')) {
        console.log(chalk.red('Already a git repository!'));
        process.exit();
    }
};

const getGithubToken = async () => {
    let token = github.getStoredGithubToken();
    if (!token) {
        await github.setGithubCredentials();
        token = await github.registerNewToken();
    }

    return token;
}

module.exports = async () => {
    clear();
    printBanner();
    checkForRepository();

    try {
        const token = await getGithubToken();
        github.githubAuth(token);
        const url = await repo.createRemoteRepo();
        await repo.createGitIgnore();
        const done = await repo.setupRepository(url);
        if (done) {
            console.log(chalk.green('All done!'));
        }
    } catch (err) {
        if (err) {
            switch (err.code) {
                case 401:
                    console.log(chalk.red('Couldn\'t log you in. Please provide the correct credentials/token.'));
                    break;
                case 422:
                    console.log(chalk.red('There already exists a remote repository with the same name.'));
                    break;
                default:
                    console.log(err);
            }
        }
    }
}
