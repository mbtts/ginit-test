const octokit = require('@octokit/rest')();
const Configstore = require('configstore');
const pkg = require('../package.json');
const _ = require('lodash');
const CLI = require('clui');
const chalk = require('chalk');
const inquirer = require('./inquirer');

const Spinner = CLI.Spinner;
const conf = new Configstore(pkg.name);

module.exports = {
    getInstance: () => {
        return octokit;
    },

    githubAuth: (token) => {
        octokit.authenticate({type: 'oauth', token});
    },

    getStoredGithubToken: () => {
        return conf.get('github.token');
    },

    setGithubCredentials: async () => {
        const credentials = await inquirer.askGithubCredentials();
        const credentialsRequest = _.extend({ type: 'basic' }, credentials);
        octokit.authenticate(credentialsRequest);
    },

    registerNewToken: async () => {
        const status = new Spinner('Authenticating you, please wait...');
        status.start();

        try {
            const response = await octokit.authorization.create({
                scopes: ['user', 'public_repo', 'repo', 'repo:status'],
                note: 'ginits, the command line tool for initializing git repositories',
            });

            const token = response.data.token;
            if (token) {
                conf.set('github.token', token);
                return token;
            } else {
                throw Error('Missing Token', 'Github token was not found in the response');
            }
        } finally {
            status.stop();
        }
    }
}
