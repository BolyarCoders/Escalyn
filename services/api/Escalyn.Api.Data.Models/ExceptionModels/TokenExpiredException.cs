using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Escalyn.Api.Data.Models.ExceptionModels
{/// <summary>
 /// Thrown when the access token has expired.
 /// The global exception handler maps this to HTTP 403 Forbidden.
 /// </summary>
    public class TokenExpiredException : Exception
    {
        public TokenExpiredException()
            : base("Your session has expired. Please sign in again.") { }

        public TokenExpiredException(string message)
            : base(message) { }
    }

}
