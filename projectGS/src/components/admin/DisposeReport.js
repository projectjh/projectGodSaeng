import * as admin_ctrl from '../../controller/admin_ctrl';
import * as server_bridge from '../../controller/server_bridge';
import CsvDownload from 'react-json-to-csv';
import { useRef, useEffect, useState } from 'react';

const DisposeReport = () => {
  const [category, setCategory] = useState([{ CATEGORY_IDX: 0, CATEGORY: '' }]);
  const [process, setProcess] = useState([
    { NOTIFY_PNUM: 0, NOTIFY_STATUS: '' },
  ]);
  const checkRefs = useRef([]); //체크박스 리스트 ref
  const start_dateRef = useRef(); //검색할 시작날짜 ref
  const end_dateRef = useRef(); //검색할 마지막 날짜 ref
  const categoryRef = useRef(); //카테고리 ref
  useEffect(() => {
    getComponentData();
  }, []);
  const getComponentData = async () => {
    //컴포넌트 생성용 리스트 받아오기
    const cate = await server_bridge.axios_instace.get('/get_cate_list');
    const proc = await server_bridge.axios_instace.get('/get_process_list');
    setCategory(cate.data);
    setProcess(proc.data);
  };
  const handleReportList = () => {
    //여기서 선택된 진행사항이 있는지를 체크한다.
    let proc_arr = [];
    checkRefs.current.map((checkbox, key) => {
      if (checkbox.checked) proc_arr.push(parseInt(checkbox.value));
      return '';
    });

    //여기서 날짜 값을 가져온다.
    const start_date = start_dateRef.current.value;
    const end_date = end_dateRef.current.value;

    //카테고리 값 가져오기
    const cate = categoryRef.current.value;
    const req_data = {
      process: proc_arr.length > 0 ? proc_arr : '',
      range: { start_date: start_date, end_date: end_date },
      category: cate === 'default' ? '' : parseInt(cate),
    };
    console.log(req_data);
  };
  const addToRefs = (e) => {
    //페이지가 로드될때마다 ref를 집어넣기 때문에 프로세스의 길이보다 길어지기 전까지만 넣게한다.
    if (checkRefs.current.length < process.length) checkRefs.current.push(e);
  };
  return (
    <div>
      관리자의 신고 내용 처리 페이지
      <div>
        기간 : <input type="date" ref={start_dateRef} /> ~{' '}
        <input type="date" ref={end_dateRef} />
      </div>
      <div>
        카테고리 :
        <select name="cate_sel" id="cate_sel" ref={categoryRef}>
          <option value="default">전체</option>
          {category.length > 1 &&
            category.map((val, key) => (
              <option key={key} value={val.CATEGORY_IDX}>
                {val.CATEGORY}
              </option>
            ))}
        </select>
      </div>
      <div>
        처리 상태 :
        {process.length > 1 &&
          process.map((val, key) => (
            <span key={key}>
              <input
                type="checkbox"
                id={`process_` + key}
                name={`process_` + key}
                value={val.NOTIFY_PNUM}
                ref={addToRefs}
              />
              <label htmlFor={`process_` + key}>{val.NOTIFY_STATUS}</label>
            </span>
          ))}
        <button onClick={handleReportList}>검색</button>
      </div>
      <CsvDownload
        className="excelbtn"
        // data : object 또는 object의 배열
        data={''}
        // filename : 파일이름
        filename="react_json_to_csv.csv"
      >
        엑셀 다운로드
      </CsvDownload>
      <div>월별 그래프</div>
      <div>
        <div>신고 그래프</div>
        <div>
          <table border={1}>
            <thead>
              <tr>
                <th>no</th>
                <th>카테고리</th>
                <th>신고일시</th>
                <th>더보기</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td></td>
                <td></td>
                <td></td>
                <td>
                  <button>더보기</button>
                </td>
              </tr>
              <tr>
                <td colSpan={4}>상세내용</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default DisposeReport;
