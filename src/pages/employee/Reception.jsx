import Employee from './Employee';
import SystemConstant from '../../data/constants';

const Reception=()=>{
  return(
    <>
      <Employee
      params={{type:SystemConstant.EmployeeType.Reception}}
      subModel='Reception'
      />
    </>
  )
}
export default Reception;