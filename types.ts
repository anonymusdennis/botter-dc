/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
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
    object: string;
    data: Array<pteroServer>;
    meta: {
      pagination: {
        total: number,
        count: number,
        per_page: number,
        current_page: number,
        total_pages: number,
        links: object;
      }
    }
  }

  type serverconfig = {
    "create_channel": false,
    "channel_name": string,
    "modpack_name": string,
    "channel_title": string,
    "channel_description": string,
    "modpack_type": string,
    "modpack_url": string,
    "additional_info": string,
    "link_1": string,
    "link_1_text" : string,
    "link_2": string,
    "link_2_text" : string,
    "footer": string,
    "server_address" : string
  }
}
