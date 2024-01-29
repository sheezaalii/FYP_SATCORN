import React, { useEffect, useState } from "react";
import Left from "components/Jobs/Left";
import Right from "components/Jobs/Right";

function Jobs() {
    const [selectedFieldId, setSelectedFieldId] = useState(9);

    return(
        <>
        <div className="relative flex w-full z-0">
            <div className="relative w-6/14 p-0">
                <Left setSelectedFieldId={setSelectedFieldId}/>
            </div>
                <Right selectedFieldId={selectedFieldId}/>
        </div>
        </>
    );
}

export default Jobs;