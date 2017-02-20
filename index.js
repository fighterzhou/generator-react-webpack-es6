#!/usr/bin/env node

const path = require('path');

// Simple in-memory vinyl file store.
// 储存文件管理？
const memFs = require('mem-fs');

// File edition helpers working on top of mem-fs
const editor = require('mem-fs-editor');

// A collection of common interactive command line user interfaces.
// 用于处理命令行确认
const inquirer = require('inquirer');

// Asynchronous recursive file & directory copying
// 用于复制文件目录
const ncp = require('ncp').ncp;

const ofs = require('fs');

// A cross platform solution to node's spawn and spawnSync.
const spawn = require('cross-spawn');

// Add console log color
const chalk = require('chalk');

const helper = require('./helper');
const execPath = process.cwd();

// 用于获取命令行参数
const yargs = require('yargs');

const pack = require('./templates/package.json');
const babelrc = require('./templates/babelrc');

const store = memFs.create();
const fs = editor.create(store);

// template path
const tempPath = () => (fileName = '') => path.resolve(__dirname, './templates', fileName);
// project generate path
const genePath = (dirPath = '') => (fileName = '') => path.resolve(execPath, dirPath, fileName);

const appname = (p = execPath) => path.basename(p).toLocaleLowerCase().replace(' ', '_');

const welcome = (() => {
  const p = fs.readJSON(path.join(__dirname, 'package.json'));
  return `Welcome to use React/Webpack/ES6 staging v${p.version}`;
})();

/* ---Start Class--- */
class Start {
  constructor() {
    this.props = {};
    this.name = appname(),
      this.generatePath = genePath();
    this.templatePath = tempPath();
    const gitUserInfo = helper.getGitUser();
    this.user = { userName: gitUserInfo.name || '', email: gitUserInfo.email || '' };
    this.isNeedCreatePath = false;

    // init yargs
    this.initYargs();

    // process.argv return an array include node.js's path, this index.js's path and other argv;
    if (process.argv.length < 3) {
      this.yargs.showHelp();
    } else {
      if (this.yargv._.length > 0) {
        this.projectCreateWithPath();
      }
      else {
        this.projectCreate();
      }
    }
  }

  initYargs() {
    const opt = {
      // 's': {
      //   alias: 'es6',
      //   describe: 'Only use es6 environment',
      // },
      'e': {
        alias: 'ie8',
        describe: 'Support IE8+ browser',
      },
      'x': {
        alias: 'redux',
        describe: 'Use redux',
      },
      'u': {
        alias: 'router',
        describe: 'Use react-router',
      },
      'c': {
        alias: 'cssm',
        describe: 'Use react css moudules',
      },
      't': {
        alias: 'testing',
        describe: 'Is need testing',
      },
      'y': {
        alias: 'yes',
        describe: 'Force to confirm',
      },
      'i': {
        alias: 'install',
        describe: 'Install all dependencies',
      },
      'v': {
        alias: 'version',
        describe: 'Show verbose log',
      },
      'h': {
        alias: 'help'
      }
    };
    this.yargs = yargs.usage(`${welcome}\n\nUsage: re | react [path] [options]`)
      .options(opt)
      .locale('zh_CN')
      .help('h');

    this.yargv = this.yargs.argv;

  }

  // copy: just copy file
  copy(from, to = from) {
    fs.copy(this.templatePath(from), this.generatePath(to));
  }

  // copyTpl: to copy .ejs file
  copyTpl(opt, from, to = from) {
    fs.copyTpl(this.templatePath(from), this.generatePath(to), opt);
  }

  appInfo({ name, ie8, redux, router, cssm, testing }) {
    const s = (value, msg) => value ? chalk.green(`+ ${msg}`) : chalk.gray(`- ${msg}`);
    return `Please confirm your App's info.
---------------------------------
  App Name : ${chalk.green(name)}
  Path : ${chalk.green(this.generatePath())}
  Modules  : 
    ${s(ie8, 'e  IE8+')}
    ${s(redux, 'x  Redux')}
    ${s(router, 'o  Router')}
    ${s(cssm, 'c  CSS modules')}
    ${s(testing, 't  Testing')}
---------------------------------
  Are you sure?`;
  };

  writingFiles() {
    const startTime = (new Date()).getTime();
    try {
      // copy static files
      ncp(this.templatePath('./asset'), this.generatePath(), function (err) {
        if (err) return console.error(err);
      });

      // write package.json
      fs.write(this.generatePath('package.json'), pack.getPackageJSON(Object.assign({}, this.props, this.user)));

      // write .gitignore
      this.copy('_.gitignore', '.gitignore');

      // write webpack.config.js
      this.copyTpl(this.props, 'webpack.config.js.ejs', 'webpack.config.js');

      // write babelrc
      fs.writeJSON(this.generatePath('.babelrc'), babelrc(this.props), null, '  ');

      // copy React code file
      this.copyReactSource();

      // copy Test code file
      this.copyTesting();

      fs.commit(() => { });

      console.log(`${chalk.green('success')} All files created!`);
      console.log(`Done in ${(new Date()).getTime() - startTime} ms.`);
    } catch (e) {
      console.error(chalk.red('error') + e.message);
    }
  }

  copyReactSource() {}

  copyTesting() {
    if (this.props.testing) {
      ncp(this.templatePath('./testing'), this.generatePath(), function (err) {
        if (err) return console.error(err);
      });
    }
  }

  projectCreate() {
    const { es6 = false, ie8 = false, redux = false, router = false, cssm = false, testing = false, y = false } = this.yargv;
    const name = this.name;
    this.props = { name, es6, ie8, redux, cssm, router, testing };

    console.log(this.yargv);
    if (typeof name !== 'string') {
      console.log(`"${name}" isn't a valid project name.`);
      process.exit(1);
    }

    if (y) {
      if (this.isNeedCreatePath) helper.mkdir(this.generatePath());
      this.writingFiles();
      return;
    }

    // show app info
    inquirer.prompt({
      type: 'confirm',
      name: 'isOK',
      message: this.appInfo(this.props),
      default: true,
    }).then(props => {
      if (props.isOK) {
        if (this.isNeedCreatePath) helper.mkdir(this.generatePath());
        this.writingFiles();
      }
    });
  }

  projectCreateWithPath() {
    this.generatePath = genePath(this.yargv._[0]);
    this.name = appname(path.resolve(execPath, this.yargv._[0]));

    try {
      ofs.accessSync(this.generatePath()); // 是否能访问目的路径
      console.log(3333);

      if (this.yargv.y) {
        this.projectCreate();
        return;
      }

      inquirer.prompt({
        type: 'confirm',
        name: 'isOk',
        message: `"${this.generatePath()}" already exists, overwrite?`,
        default: true
      }).then((p) => {
        if (p.isOk) {
          // 如果确定覆盖,继续创建
          this.projectCreate();
        } else {
          // 否则 退出
          console.log('abort!');
          process.exit(1);
        }
      });
    } catch (e) {
      // 不存在当前路径，则创建
      this.isNeedCreatePath = true;
      this.projectCreate();
    }
  }
}

new Start();
