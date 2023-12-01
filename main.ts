import { GraphQLInt, GraphQLObjectType, GraphQLSchema, graphql } from 'graphql';
import { IncomingMessage, ServerResponse, createServer } from 'http';

class Database {
  #count = 0;
  setCount(n: number) {
    this.#count = n;
  }
  getCount() {
    return this.#count;
  }
}

const database = new Database();

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      count: {
        type: GraphQLInt,
        resolve: () => {
          return database.getCount();
        },
      },
    },
  }),
  mutation: new GraphQLObjectType({
    name: 'RootMutation',
    fields: {
      increment: {
        type: GraphQLInt,
        args: {
          number: {
            type: GraphQLInt,
            description: 'The number to increment by',
          },
        },
        resolve: (_, args) => {
          database.setCount(database.getCount() + args.number);
          return database.getCount();
        },
      },
    },
  }),
});

const server = createServer(async (req, res) => {
  if (req.url === '/graphql') {
    const readedBody = await readBody(req);
    const result = await graphql({
      source: readedBody,
      schema: schema,
    });
    s_ok(
      res,
      result.data ? result.data : result.errors?.toString(),
      !result.data
    );
  } else {
    s_error(res);
  }
});

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((rs) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      rs(body);
    });
  });
}
function s_error(res: ServerResponse) {
  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/html');
  res.end('<h1>Error!!!</h1>');
}
function s_ok(res: ServerResponse, data: any, isErr: boolean) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  let s_data = Object.create(null);
  s_data = { ...data };
  res.end(!isErr ? JSON.stringify(s_data) : data);
}

server.listen(3000, () => {
  console.log('Listening on port :3000');
});
