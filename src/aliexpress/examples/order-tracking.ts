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

export const orderTrackingExp3 = {
  ret: true,
  msg: '',
  code: '',
  data: {
    tracking_detail_line_list: {
      tracking_detail: [
        {
          detail_node_list: {
            detail_node: [
              {
                time_stamp: 1770194210868,
                tracking_detail_desc: 'Your package is currently being prepared.',
                tracking_name: 'Package in preparation',
              },
              {
                time_stamp: 1770192487065,
                tracking_detail_desc: 'Your order has been successfully created',
                tracking_name: 'Order created',
              },
            ],
          },
          package_item_list: {},
          carrier_name: 'AliExpress Selection Standard',
          mail_no: '',
          eta_time_stamps: 1771576610476,
        },
      ],
    },
  },
};
