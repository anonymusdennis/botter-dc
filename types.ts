/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
type pt_instance = {
  id: number;
  external_id: any;
  uuid: string;
  identifier: string;
  name: string;
  description: string;
  status: string;
  suspended: true;
  limits: {
    memory: number;
    swap: number;
    disk: number;
    io: number;
    cpu: number;
    threads: any;
    oom_disabled: true;
  };
  feature_limits: {
    databases: number;
    allocations: number;
    backups: number;
    proxies: number;
  };
  user: number;
  node: number;
  allocation: number;
  nest: number;
  egg: number;
  container: {
    startup_command: string;
    image: string;
    installed: number;
    environment: {
      SERVER_JARFILE: string;
      VANILLA_VERSION: string;
      STARTUP: string;
      P_SERVER_LOCATION: string;
      P_SERVER_UUID: string;
      P_SERVER_ALLOCATION_LIMIT: number;
    };
  };
  updated_at: string;
  created_at: string;
}
type pteroServer = {
  object: string;
  attributes: pt_instance;
};
type customWhitelistLine = {
  uuid: string;
  name: string;
  dcid: string;
  active?: boolean;
};
type serverHolder = {
  data: Array<pteroServer>
}