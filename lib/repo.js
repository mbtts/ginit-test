const _ = require('lodash');
const fs = require('fs');
const git = require('simple-git')();
const CLI = require('clui');
const touch = require('touch');
const inquirer = require('./inquirer');
const gh = require('./github');

const Spinner = CLI.Spinner;

module.exports = {
    createRemoteRepo: async () => {
        const github = gh.getInstance();
        const answers = await inquirer.askRepositoryDetails();
        const request = {
            name: answers.name,
            description: answers.description,
            private: (answers.visibility === 'private'),
        };
        const status = new Spinner('Creating remote repository...');
        status.start();

        try {
            const response = await github.repos.create(request);
            return response.data.ssh_url
        } catch (err) {
            throw err;
        } finally {
            status.stop();
        }
    },

    createGitIgnore: async () => {
        let ignored;
        const filelist = _.without(fs.readdirSync('.'), '.git', '.gitignore');
        if (filelist.length) {
            const answers = await inquirer.askIgnoreFiles(filelist);
            ignored = answers.ignore;
            if (ignored.length) {
                fs.writeFileSync('.gitignore', ignored.join('\n'));
            }
        }

        if (!ignored) {
            touch('.gitignore');
        }
    },

    setupRepository: async (url) => {
        const status = new Spinner('Initialising local repository and pushing to remote...');
        status.start();

        try {
            await git.init()
                .add('.gitignore')
                .add('./*')
                .commit('Initial commit')
                .addRemote('origin', url)
                .push('origin', 'master');
            return true;
        } catch (err) {
            throw err;
        } finally {
            status.stop();
        }
    }
};
