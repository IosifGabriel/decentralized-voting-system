App = {
  web3Provider: null,
  contracts: {},
  account: "0x0",

  init: async () => {
    return await App.initWeb3()
  },

  initWeb3: async () => {
    if (typeof web3 !== "undefined") {
      App.web3Provider = web3.currentProvider
      web3 = new Web3(web3.currentProvider)
    } else {
      App.web3Provider = new Web3.providers.HttpProvider("http://localhost:7545")
      web3 = new Web3(App.web3Provider)
    }
    return App.initContract()
  },

  initContract: () => {
    $.getJSON("Election.json",  (election) => {
      App.contracts.Election = TruffleContract(election)
      App.contracts.Election.setProvider(App.web3Provider)
      return App.render()
    })
  },

  render: () => {
    let electionInstance;
    const loader = $("#loader")
    const content = $("#content")

    loader.show()
    content.hide()

    // Load account data
    web3.eth.getCoinbase((err, account) => {
      if (err === null) {
        App.account = account
        $("#account").html("Connected with account: " + account)
      }
    })

    // Load contract data
    App.contracts.Election.deployed()
      .then((instance) => {
        electionInstance = instance
        return electionInstance.candidatesCount()
      })
      .then(async (candidatesCount) => {
        const candidatesResults = $("#candidates")
        candidatesResults.empty()

        const candidatesSelect = $("#candidatesSelect")
        candidatesSelect.empty()

        for (let i = 0; i < candidatesCount; i++) {
          electionInstance.candidates(i).then((candidate) => {
            const id = candidate[0]
            const name = candidate[1]
            const voteCount = candidate[2]

            const candidateTemplate = `<tr><th>${id}</th><td>${name}</td><td>${voteCount}</td></tr>`
            candidatesResults.append(candidateTemplate)

            const candidateOption = `<option value="${id}">${name}</ option>`
            candidatesSelect.append(candidateOption)
          });
        }

        const allVotes = await electionInstance.getAllVotes()
        const currentWinner = await electionInstance.getWinner()

        $("#totalVotes").text(allVotes.toNumber())
        $("#currentWinner").text(currentWinner)
      })
      .then(() => {
        loader.hide()
        content.show()
      })
      .catch((error) => {
        console.error(error)
      })
  },

  castVote: () => {
    const candidateId = $("#candidatesSelect").val()
    App.contracts.Election.deployed()
      .then((instance) => {
        return instance.vote(candidateId, { from: App.account })
      })
      .then((result) => {
        console.log('==', result)
        // Wait for votes to update
        $("#content").hide();
        $("#loader").show();
      })
      .catch((err) => {
        console.error(err);
      })
  },
}

$(() => {
  $(window).load(() => {
    App.init()
  })
})
