import { APIConfig } from '../types';

export const exampleConfig: APIConfig = {
  models: {
    Person: { id: "number", name: "string" },
    Ticket: { id: "number", user_id: "number", subject: "string" },
    Event: { id: "number", title: "string" }
  },
  routes: [
    {
      path: "/people",
      model: "Person",
      actions: {
        list: { secured: false },
        create: {}
      },
      routes: [
        {
          path: ":id",
          actions: {
            get: { handlerFunction: "getUserSummary" },
            update: { ownershipCheckField: "id", updateFields: ["name"] },
            delete: { secured: "checkApiSecurity", ownershipCheckField: "id" }
          },
          routes: [
            {
              path: "tickets",
              model: "Ticket",
              actions: {
                sublist: { parentKey: "user_id", secured: false },
                create: {},
                delete: { ownershipCheckField: "user_id" },
                custom: {
                  customQuery: "SELECT DATE(created_at) as day, COUNT(*) as count FROM tickets WHERE user_id = ? GROUP BY day ORDER BY day"
                }
              }
            }
          ]
        }
      ]
    },
    {
      path: "/tickets/:id",
      model: "Ticket",
      actions: {
        get: { secured: false },
        create: { handlerFunction: "getUserSummary" },
        update: { ownershipCheckField: "user_id", updateFields: ["subject"], handlerFunction: "getUserSummary" },
        delete: { secured: "checkApiSecurity", ownershipCheckField: "user_id", handlerFunction: "getUserSummary" }
      }
    },
    {
      path: "/events",
      model: "Event",
      routes: [
        {
          path: ":id/tickets",
          model: "Ticket",
          actions: {
            sublist: { parentKey: "event_id" }
          }
        }
      ]
    }
  ]
};
