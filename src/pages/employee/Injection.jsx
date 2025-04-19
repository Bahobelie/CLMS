import Employee from './Employee';
import SystemConstant from '../../data/constants';

const Injection = () => {
  return (
    <>
      <Employee
        params={{ type: SystemConstant.EmployeeType.Injection }}
        subModel="Injection"
      />
    </>
  );
};

export default Injection;
