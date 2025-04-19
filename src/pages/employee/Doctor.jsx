import Employee from './Employee';
import SystemConstant from '../../data/constants';

const Doctor=()=>{
  return (
  <>
    <Employee
      params={{type:SystemConstant.EmployeeType.Doctor}}
      detailpathe='doctor-details'
      subModel='Doctor'
    />
  </>
  )
}
export default Doctor