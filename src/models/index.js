// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { User, Organization, UserOrganization } = initSchema(schema);

export {
  User,
  Organization,
  UserOrganization
};