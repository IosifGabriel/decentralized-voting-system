App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  init: async function () {
    return await App.initWeb3();
  },

  initWeb3: async function () {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function () {
    $.getJSON("Election.json", function (election) {
      App.contracts.Election = TruffleContract(election);
      App.contracts.Election.setProvider(App.web3Provider);
      return App.render();
    });
  },

  render: function () {
    let electionInstance;
    const loader = $("#loader");
    const content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function (err, account) {
      if (err === null) {
        App.account = account;
        $("#account").html("Your Account: " + account);
      }
    });

    // Load contract data
    App.contracts.Election.deployed().then(function (instance) {
      electionInstance = instance;
      return electionInstance.candidatesCount();
    }).then(function (candidatesCount) {
      const candidatesResults = $("#candidates");
      candidatesResults.empty();

      for (var i = 0; i < candidatesCount; i++) {
        electionInstance.candidates(i).then(function (candidate) {
          var id = candidate[0];
          var name = candidate[1];
          var voteCount = candidate[2];

          const candidateTemplate = `<tr><th>${id}</th><td>${name}</td><td>${voteCount}</td></tr>`
          candidatesResults.append(candidateTemplate);
        });
      }
    }).then(function () {
      loader.hide();
      content.show();
    }).catch(function (error) {
      console.warn(error);
    });
  }
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
