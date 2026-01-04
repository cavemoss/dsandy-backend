export const orderTrackingExp1 = {
  ret: false,
  msg: 'TRACKING DATA NOT FOUND',
  code: '1001',
};

export const orderTrackingExp2 = {
  ret: true,
  msg: 'error message',
  code: 'error code',
  data: {
    tracking_detail_line_list: [
      {
        detail_node_list: [
          {
            time_stamp: '1720181940000',
            tracking_detail_desc: 'Package delivered',
            tracking_name: 'Delivery update',
          },
        ],
        package_item_list: [
          {
            sku_desc: 'Color:Large',
            quantity: '1',
            item_id: '1005005511268056',
            item_title:
              'car sunshade car sunshade retractable sunscreen heat insulation front windshield parasol',
          },
        ],
        carrier_name: 'AliExpress Selection Standard',
        mail_no: '62727952231',
        eta_time_stamps: '1720514236934',
      },
    ],
  },
};
