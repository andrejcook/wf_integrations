"use strict";

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/startStopFlow/:flowId",
      handler: "integration-flow.startStopFlow",
      config: {
        policies: [],
      },
    },
    {
      method: "GET",
      path: "/processRequest/:flowId",
      handler: "integration-flow.processRequest",
      config: {
        policies: [],
      },
    },
    {
      method: "GET",
      path: "/getFlowSummery",
      handler: "integration-flow.getFlowSummery",
      config: {
        policies: [],
      },
    },

    {
      method: "POST",
      path: "/clearsnapshot/:flowId",
      handler: "integration-flow.clearsnapshot",
      config: {
        policies: [],
      },
    },
  ],
};
