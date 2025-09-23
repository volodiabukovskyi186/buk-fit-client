import {USER_ROLES_ENUM} from "../enums/users-roles.enum";
import {USER_STATUS_ENUM} from "../enums/users-status.enum";
import {Timestamp} from "@angular/fire/firestore";

export interface ClientInterface {
  createdAt: Timestamp;
  id: string;
  coachId: string | null;
  status: USER_STATUS_ENUM;
  role: USER_ROLES_ENUM;
  email: string;
  phone: string;
  name: string;
  secondName: string;
  tgUser:any;
  tgChatId?:any;
}
