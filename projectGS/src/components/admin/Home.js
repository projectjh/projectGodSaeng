import styles from './css/Home.module.scss';
import React from 'react';
import './css/Home.module.scss';
import TodoList from './TodoList';
// import ChartWidgets from './ChartWidgets';
// import SummaryWidgets from './SummaryWidgets';
// import NotifyListWidgets from './NotifyListWidgets';
// import NoticeWidgets from './NoticeWidgets';

import DisposeListMini from './home_components/DisposeListMini';
import DisposeSummary from './home_components/DisposeSummary';
import NoticeListMini from './home_components/NoticeListMini';
import ReportChart from './home_components/ReportChart';
import AdminLogin from './AdminLogin';
import * as server_bridge from '../../controller/server_bridge';

import { useEffect, useState } from 'react';

const Home = () => {
  const [daily_summary, setDailySummary] = useState([]); //통계표/시각화 자료용 데이터표
  const [noti_list, setNotiList] = useState([]);
  const [board_list, setBoardList] = useState([]);
  const [sum_data, setSumData] = useState({});

  useEffect(() => {
    get_daily_summary();
    get_notify_mini();
    get_board_mini();
  }, []);
  const json2Arr = (obj) => {
    //json객체를 리스트화하는 함수
    let arr = [];
    Object.keys(obj).forEach((key) => arr.push(obj[key]));
    return arr;
  };
  const get_board_mini = async () => {
    //게시글 리스트를 가져온다.

    const res = await server_bridge.axios_instace.post('/getBoardMini');
    setBoardList(res.data);
  };

  const get_notify_mini = async () => {
    const res = await server_bridge.axios_instace.get('/getNotifyMini'); //메인페이지용 신고 내역
    setNotiList(res.data);
  };
  const get_daily_summary = async () => {
    //최근 1주일간 신고 통계
    const res = await server_bridge.axios_instace.get('/getDailySummary'); //통계표를 호출한다.
    let summary_json = res.data;
    let filtered = Object.keys(summary_json).filter(
      //일자만을 뺀 데이터
      (element) => element !== 'NOTIFY_DATE',
    );
    let date_list = json2Arr(summary_json['NOTIFY_DATE']); //일자만을 리스트로 뽑아냄.

    const col_arr = ['1', '2', '3', '4'];
    const difference = col_arr.filter((x) => !filtered.includes(x)); //만약에 신고 진행사항에 없는 내역이 있으면 찾아낸다.
    if (difference.length > 0) {
      //신고접수/담당자배치/처리중/처리 완료 중에 하나라도 없다면 없는 부분은 0처리(결측값 처리)
      for (let j = 0; j < difference.length; j++) {
        let nan_data = {};
        for (let i = 0; i < date_list.length; i++) {
          nan_data[i] = 0;
        }
        summary_json[difference[j]] = nan_data;
      }
    }
    let total_arr = [];
    date_list.forEach((_date, idx) => {
      //결측값 처리한 데이터를 표나 그래프에서 사용할 수 있도록 재구성한다.
      let data = {
        date: _date, //접수일
        c1: json2Arr(summary_json[1])[idx], //신고접수
        c2: json2Arr(summary_json[2])[idx], //담당자 배치
        c3: json2Arr(summary_json[3])[idx], //처리중
        c4: json2Arr(summary_json[4])[idx], //처리완료
      };
      total_arr.push(data);
    });
    let data_sum = {
      c1_sum: json2Arr(summary_json[1]).reduce((acc, val) => acc + val, 0),
      c2_sum: json2Arr(summary_json[2]).reduce((acc, val) => acc + val, 0),
      c3_sum: json2Arr(summary_json[3]).reduce((acc, val) => acc + val, 0),
      c4_sum: json2Arr(summary_json[4]).reduce((acc, val) => acc + val, 0),
    };
    setSumData(data_sum);
    setDailySummary(total_arr);
  };
  return (
    <>
      {window.sessionStorage.getItem('USER_ID') !== null ? (
        <>
          <TodoList data={sum_data} />
          <div className="container">
            <ReportChart data={daily_summary} />
            <DisposeSummary data={daily_summary} />
            <div className="clear" style={{ clear: 'both' }} />
            <DisposeListMini data={noti_list} />
            <NoticeListMini data={board_list} />
          </div>
        </>
      ) : (
        <AdminLogin />
      )}
    </>
  );
};
export default Home;

// export default function Home() {
//   return (
//     <div className="home">
//       <TodoList />
//       <div className="homeWidgets">
//         <ChartWidgets />
//         <SummaryWidgets />
//       </div>
//       <div className="homeWidgets">
//         <NotifyListWidgets />
//         <NoticeWidgets />
//       </div>
//     </div>
//   );
// }
