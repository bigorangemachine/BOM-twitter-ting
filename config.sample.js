var config={};
config.db = {'type':'mysql','user':'youruser','pass':'yourpass','host':'localhost','db':'yourdb','version':'5.6'
    //,'doc_root':'/your/path/to/project-name'//pm2 no cwd - if you use cwd you might need to specify your root
};

config.API={
    'twitterendpoint':'https://api.twitter.com/1.1/{noun}/',
    'api_key':'YOUR-API-KEY',
    'secret': 'YOUR-API-SECRET',
    'qs':'search',
    'account_num':'88888'
};
//https://yourmainhost.atlassian.net/rest/api/2/project
config.cachepath='_cache/';//matches the package.json
module.exports = config;
