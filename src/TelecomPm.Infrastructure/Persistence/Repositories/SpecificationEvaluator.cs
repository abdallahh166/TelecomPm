using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TelecomPM.Domain.Common;
using TelecomPM.Domain.Specifications;

namespace TelecomPm.Infrastructure.Persistence.Repositories
{
    public static class SpecificationEvaluator<TEntity, TId>
    where TEntity : AggregateRoot<TId>
    where TId : notnull
    {
        public static IQueryable<TEntity> GetQuery(
            IQueryable<TEntity> inputQuery,
            ISpecification<TEntity> specification)
        {
            var query = inputQuery;

            // Apply criteria
            if (specification.Criteria != null)
            {
                query = query.Where(specification.Criteria);
            }

            // Apply includes
            query = specification.Includes
                .Aggregate(query, (current, include) => current.Include(include));

            // Apply string-based includes
            query = specification.IncludeStrings
                .Aggregate(query, (current, include) => current.Include(include));

            // Apply ordering
            if (specification.OrderBy != null)
            {
                query = query.OrderBy(specification.OrderBy);
            }
            else if (specification.OrderByDescending != null)
            {
                query = query.OrderByDescending(specification.OrderByDescending);
            }

            // Apply ThenBy
            if (specification.OrderBy != null || specification.OrderByDescending != null)
            {
                var orderedQuery = (IOrderedQueryable<TEntity>)query;

                foreach (var thenBy in specification.ThenBy)
                {
                    orderedQuery = orderedQuery.ThenBy(thenBy);
                }

                foreach (var thenByDesc in specification.ThenByDescending)
                {
                    orderedQuery = orderedQuery.ThenByDescending(thenByDesc);
                }

                query = orderedQuery;
            }

            // Apply paging
            if (specification.IsPagingEnabled)
            {
                query = query.Skip(specification.Skip).Take(specification.Take);
            }

            return query;
        }
    }
}
