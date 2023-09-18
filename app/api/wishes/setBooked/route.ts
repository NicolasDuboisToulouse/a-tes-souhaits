import { NextRequest, NextResponse } from 'next/server';
import * as loginService from '_lib/server/loginService';
import { getDbStatement } from '_lib/server/database';
import { errorResponse, ApplicationError, logger } from '_lib/server/applicationError';


export async function POST(request: NextRequest) {
  try {
    const user = loginService.tokenLogOn();

    const { wishId, booked } = await request.json();
    if (wishId == null || booked == null) {
      throw new ApplicationError('Client Error: invalid API usage.', ApplicationError.CLIENT_ERROR);
    }

    // Get current bookedBy to check user don't unbook other
    const bookedBy = getDbStatement('getBookedBy', 'SELECT bookedBy FROM wishes WHERE id=?', {pluck:true}).get<string>(wishId);
    console.log(bookedBy);
    if (bookedBy === undefined) {
      logger.warn('Cannot find wish ' + wishId + ' whle booking it!');
      throw new ApplicationError('Client Error: invalid API usage.', ApplicationError.CLIENT_ERROR);
    }

    let newBookedBy: string;
    if (bookedBy.length == 0 && booked == true) {
      // User book the wish
      newBookedBy = user.userName!;
    } else if (bookedBy == user.userName && booked == false) {
      // User unbook the wish
      newBookedBy = '';
    } else {
      logger.warn({ user: user.userName, wishId, bookedBy, wantBook: booked }, 'Booking API error:');
      throw new ApplicationError('Client Error: invalid API usage.', ApplicationError.CLIENT_ERROR);
    }

    if (getDbStatement('setBooked', 'UPDATE wishes SET bookedBy=? WHERE id=?').run(newBookedBy, wishId) == false) {
      throw new ApplicationError('Unexpected error while booking a wish', ApplicationError.SERVER_ERROR);
    }

    return NextResponse.json({}, { status: 200 });

  } catch(error) {
    return errorResponse(error);
  }
}
