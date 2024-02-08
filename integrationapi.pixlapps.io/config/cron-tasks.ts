import moment from "moment";

module.exports = {
  processRequest: {
    task: async ({ strapi }) => {
      try {
        console.log("cron Job started");
        const sql = `SELECT  link.integration_flow_id
        FROM integration_flow_details as ifd inner join integration_flow_details_integration_flow_links as link on ifd.id=link.integration_flow_detail_id  
         WHERE next_run_date IS NOT NULL and status='Sleeping' and next_run_date<='${moment(
           new Date()
         ).format("YYYY-MM-DD HH:mm:ss.SSSSSS")}'
        ORDER BY next_run_date ASC LIMIT 1`;

        let result = await strapi.db.connection.raw(sql);
        if (
          result &&
          result[0] &&
          result[0][0] &&
          result[0][0].integration_flow_id
        ) {
          await strapi
            .controller("api::integration-flow.integration-flow")
            .processRequest({
              params: { flowId: result[0][0].integration_flow_id },
            });
        }
      } catch (ex) {
        console.log(ex);
      }
    },
    options: {
      rule: "* * * * *",
    },
  },
};
